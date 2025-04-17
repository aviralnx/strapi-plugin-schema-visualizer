import AWS from 'aws-sdk';
import path from 'path';
import { Readable } from 'stream';
import { errors } from '@strapi/utils';

const { ApplicationError } = errors;

/**
 * S3 Media Sync service
 */
export default ({ strapi }) => ({
  /**
   * Initialize S3 client
   * @returns {AWS.S3} S3 client
   */
  getS3Client() {
    // Get config values using the function call pattern
    console.log('Initializing S3 client');
    const config = strapi.plugin('s3-media-sync').config;
    const accessKeyId = config('accessKeyId');
    const secretAccessKey = config('secretAccessKey');
    const region = config('region');

    console.log('Debug - Config values:', {
      hasAccessKeyId: !!accessKeyId,
      hasSecretKey: !!secretAccessKey,
      region
    });

    // Add detailed logging for missing configuration
    const missingConfig = [];
    if (!accessKeyId) missingConfig.push('accessKeyId');
    if (!secretAccessKey) missingConfig.push('secretAccessKey');
    if (!region) missingConfig.push('region');

    if (missingConfig.length > 0) {
      const missingConfigStr = missingConfig.join(', ');
      console.error(`S3 configuration incomplete. Missing: ${missingConfigStr}`);
      throw new ApplicationError(`S3 configuration incomplete. Missing: ${missingConfigStr}`);
    }

    return new AWS.S3({
      accessKeyId,
      secretAccessKey,
      region,
    });
  },

  /**
   * List all objects in the configured S3 bucket
   * @returns {Promise<AWS.S3.ObjectList>} List of S3 objects
   */
  async listS3Objects() {
    const s3 = this.getS3Client();
    // Get config values using the function call pattern
    const config = strapi.plugin('s3-media-sync').config;
    const bucket = config('bucket');
    const prefix = config('prefix');

    // Check if bucket is configured
    if (!bucket) {
      console.error('S3 bucket name is missing in configuration');
      throw new ApplicationError('S3 bucket name is missing in configuration');
    }

    console.log(`Attempting to list objects from bucket: ${bucket}, prefix: ${prefix || '(root)'}`);

    try {
      const objects = [];
      let continuationToken;

      do {
        const params: AWS.S3.ListObjectsV2Request = {
          Bucket: bucket,
          Prefix: prefix || '',
          ContinuationToken: continuationToken,
        };

        console.log(`Sending listObjectsV2 request with params:`, JSON.stringify(params, null, 2));

        const data = await s3.listObjectsV2(params).promise();
        console.log(`Received ${data.Contents?.length || 0} objects from S3`);

        if (data.Contents && data.Contents.length > 0) {
          // Filter out folders and empty objects
          const filteredObjects = data.Contents.filter(
            obj => obj.Size > 0 && !obj.Key.endsWith('/')
          );

          console.log(`Found ${filteredObjects.length} valid files after filtering folders and empty objects`);
          objects.push(...filteredObjects);
        }

        continuationToken = data.NextContinuationToken;
      } while (continuationToken);

      console.log(`Total objects found: ${objects.length}`);
      return objects;
    } catch (error) {
      console.error('Error listing S3 objects:', error);
      console.error('Error details:', error.message);
      if (error.code) console.error('AWS Error Code:', error.code);
      throw new ApplicationError(`Failed to list S3 objects: ${error.message}`);
    }
  },

  /**
   * Get S3 object details
   * @param {string} key - S3 object key
   * @returns {Promise<AWS.S3.GetObjectOutput>} S3 object data
   */
  async getS3Object(key) {
    const s3 = this.getS3Client();
    const config = strapi.plugin('s3-media-sync').config;
    const bucket = config('bucket');

    try {
      return await s3.getObject({ Bucket: bucket, Key: key }).promise();
    } catch (error) {
      strapi.log.error(`Error getting S3 object ${key}:`, error);
      throw new ApplicationError(`Failed to get S3 object ${key}: ${error.message}`);
    }
  },

  /**
   * Get file metadata from S3 object
   * @param {AWS.S3.Object} s3Object - S3 object
   * @returns {Object} File metadata
   */
  getFileMetadata(s3Object) {
    const { Key, Size, LastModified } = s3Object;
    const filename = path.basename(Key);
    const ext = path.extname(filename).toLowerCase();

    const mimetype = this.getMimeType(ext);

    return {
      name: filename,
      alternativeText: filename,
      caption: filename,
      hash: `s3_${Buffer.from(Key).toString('base64').replace(/[/+=]/g, '_')}`,
      size: Size,
      ext,
      mime: mimetype,
      path: Key,
      lastModified: LastModified,
    };
  },

  /**
   * Get mime type from file extension
   * @param {string} ext - File extension
   * @returns {string} Mime type
   */
  getMimeType(ext) {
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.txt': 'text/plain',
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.xml': 'application/xml',
      '.zip': 'application/zip',
    };

    return mimeTypes[ext] || 'application/octet-stream';
  },

  /**
   * Check if file already exists in media library
   * @param {string} hash - File hash
   * @returns {Promise<boolean>} True if file exists
   */
  async fileExistsInMediaLibrary(hash) {
    const exists = await strapi.query('plugin::upload.file').findOne({
      where: { hash },
    });

    return !!exists;
  },
});
