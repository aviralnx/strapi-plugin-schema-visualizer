import { errors } from '@strapi/utils';
import path from 'path';
import { Readable } from 'stream';

const { ApplicationError } = errors;

/**
 * Sync service for S3 Media Sync plugin
 */
export default ({ strapi }) => ({
  /**
   * Sync S3 bucket contents to Strapi media library
   * @returns {Promise<Object>} Sync statistics
   */
  async syncS3ToMediaLibrary() {
    console.log('Starting S3 to Media Library sync');

    try {
      // Log the plugin configuration (without sensitive data)
      const config = strapi.plugin('s3-media-sync').config;
      console.log('S3 Media Sync Configuration:', {
        hasAccessKeyId: !!config('accessKeyId'),
        hasSecretAccessKey: !!config('secretAccessKey'),
        region: config('region'),
        bucket: config('bucket'),
        prefix: config('prefix') || '(root)',
        overwrite: config('overwrite'),
        maxConcurrentUploads: config('maxConcurrentUploads'),
      });

      // Check for required config values before attempting to sync
      const missing = [];
      if (!config('accessKeyId')) missing.push('accessKeyId');
      if (!config('secretAccessKey')) missing.push('secretAccessKey');
      if (!config('region')) missing.push('region');
      if (!config('bucket')) missing.push('bucket');

      if (missing.length > 0) {
        const missingFields = missing.join(', ');
        console.error(`Cannot sync S3 to Media Library: Missing required configuration: ${missingFields}`);
        throw new Error(`S3 configuration incomplete. Missing: ${missingFields}`);
      }

      const s3Service = strapi.plugin('s3-media-sync').service('s3');
      const { maxConcurrentUploads, overwrite } = config;

      // Get list of all S3 objects
      console.log('Fetching objects from S3...');
      const s3Objects = await s3Service.listS3Objects();

      if (!s3Objects || s3Objects.length === 0) {
        console.log('No objects found in S3 bucket');
        return {
          success: true,
          totalFiles: 0,
          filesSynced: 0,
          filesSkipped: 0,
          filesErrored: 0,
          lastSync: new Date().toISOString(),
        };
      }

      console.log(`Found ${s3Objects.length} objects in S3. Starting sync process...`);
      s3Objects.length = 2;

      let filesSynced = 0;
      let filesSkipped = 0;
      let filesErrored = 0;

      // Process files in batches to avoid overwhelming the system
      const batchSize = maxConcurrentUploads || 5;
      const totalBatches = Math.ceil(s3Objects.length / batchSize);
      console.log(`Processing in ${totalBatches} batches with max ${batchSize} files per batch`);

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const batchStart = batchIndex * batchSize;
        const batchEnd = Math.min(batchStart + batchSize, s3Objects.length);
        const batch = s3Objects.slice(batchStart, batchEnd);

        console.log(`Processing batch ${batchIndex + 1}/${totalBatches} with ${batch.length} files`);

        // Process batch with Promise.all for parallel processing
        const results = await Promise.all(
          batch.map(async (s3Object) => {
            try {
              console.log(`Processing file: ${s3Object.Key}`);
              const fileMetadata = s3Service.getFileMetadata(s3Object);

              // Check if file already exists in the media library
              const exists = await s3Service.fileExistsInMediaLibrary(fileMetadata.hash);

              if (exists && !overwrite) {
                // Skip existing file if overwrite is disabled
                console.log(`File ${s3Object.Key} already exists in media library, skipping`);
                return { status: 'skipped', key: s3Object.Key };
              }

              if (exists) {
                console.log(`File ${s3Object.Key} exists but overwrite is enabled, replacing`);
              }

              // Get S3 object
              console.log(`Fetching file content from S3: ${s3Object.Key}`);
              const s3Data = await s3Service.getS3Object(s3Object.Key);

              // Create a readable stream from the S3 data
              const buffer = s3Data.Body as Buffer;
              const stream = Readable.from(buffer);

              // Use Strapi's upload service to add the file to the media library
              console.log(`Uploading file to media library: ${fileMetadata.name} (${fileMetadata.size} bytes)`);

              // Debug the file data
              console.log('File metadata for upload:', {
                name: fileMetadata.name,
                size: fileMetadata.size,
                mime: fileMetadata.mime,
                hash: fileMetadata.hash,
              });

              // Updated structure for Strapi V5 upload service
              await strapi.plugin('upload').service('upload').upload({
                data: {
                  fileInfo: {
                    name: fileMetadata.name,
                    alternativeText: fileMetadata.alternativeText,
                    caption: fileMetadata.caption,
                    hash: fileMetadata.hash,
                  },
                },
                files: {
                  filepath: buffer, // Using buffer as filepath parameter
                  originalFilename: fileMetadata.name, // Using originalFilename instead of name
                  mimetype: fileMetadata.mime, // Using mimetype instead of type
                  size: fileMetadata.size,
                },
              });

              console.log(`Successfully synced file: ${s3Object.Key}`);
              return { status: 'synced', key: s3Object.Key };
            } catch (error) {
              console.error(`Error syncing file ${s3Object.Key}:`, error);
              console.error('Error details:', error.message);
              if (error.code) console.error('Error code:', error.code);
              return { status: 'error', key: s3Object.Key, error: error.message };
            }
          })
        );

        // Update counters
        results.forEach((result) => {
          if (result.status === 'synced') filesSynced++;
          else if (result.status === 'skipped') filesSkipped++;
          else if (result.status === 'error') filesErrored++;
        });

        console.log(`Batch ${batchIndex + 1} complete. Progress: synced=${filesSynced}, skipped=${filesSkipped}, errors=${filesErrored}`);
      }

      // Save sync statistics
      const syncStats = {
        success: true,
        totalFiles: s3Objects.length,
        filesSynced,
        filesSkipped,
        filesErrored,
        lastSync: new Date().toISOString(),
      };

      // Store sync statistics in plugin store
      console.log('Sync complete. Storing sync statistics:', syncStats);
      await this.storeSyncStats(syncStats);

      return syncStats;
    } catch (error) {
      console.error('Error syncing S3 to media library:', error);
      console.error('Error details:', error.message);
      if (error.stack) console.error('Stack trace:', error.stack);
      throw new Error(`Failed to sync S3 to media library: ${error.message}`);
    }
  },

  /**
   * Store sync statistics in plugin store
   * @param {Object} stats - Sync statistics
   */
  async storeSyncStats(stats) {
    await strapi.store({ type: 'plugin', name: 's3-media-sync', key: 'syncStats' }).set({ value: stats });
  },

  /**
   * Get sync statistics from plugin store
   * @returns {Promise<Object>} Sync statistics
   */
  async getSyncStats() {
    const stats = await strapi.store({ type: 'plugin', name: 's3-media-sync', key: 'syncStats' }).get();
    return stats?.value || {
      success: false,
      totalFiles: 0,
      filesSynced: 0,
      filesSkipped: 0,
      filesErrored: 0,
      lastSync: null,
    };
  },
});
