import type { Core } from '@strapi/strapi';
import { v2 as cloudinary } from 'cloudinary';
import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import FormData from 'form-data';
import { CloudinaryConfig, CloudinaryResource, SyncStats } from '../types';

const TEMP_DIR = path.join(process.cwd(), '.tmp');

const service = ({ strapi }: { strapi: Core.Strapi }) => ({
  getWelcomeMessage() {
    return 'Welcome to Strapi 🚀';
  },

  getConfig(): CloudinaryConfig {
    const config: CloudinaryConfig = {
      cloudName: strapi.plugin('sync-dam-library').config('cloudName') as string,
      apiKey: strapi.plugin('sync-dam-library').config('apiKey') as string,
      apiSecret: strapi.plugin('sync-dam-library').config('apiSecret') as string,
      resourceType: (strapi.plugin('sync-dam-library').config('resourceType') as string) || 'image',
      folderPath: (strapi.plugin('sync-dam-library').config('folderPath') as string) || '',
      maxResults: (strapi.plugin('sync-dam-library').config('maxResults') as number) || 50,
      overwrite: (strapi.plugin('sync-dam-library').config('overwrite') as boolean) || false,
      syncInterval: (strapi.plugin('sync-dam-library').config('syncInterval') as number) || 0
    };

    return config;
  },

  initCloudinary() {
    const config = this.getConfig();
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
      secure: true,
    });
    return cloudinary;
  },

  async getCloudinaryResources(nextCursor: string | null = null) {
    const config = this.getConfig();
    const cloudinaryClient = this.initCloudinary();

    const options: any = {
      resource_type: config.resourceType || 'image',
      max_results: config.maxResults || 50,
      metadata: true,
    };

    if (nextCursor) {
      options.next_cursor = nextCursor;
    }

    if (config.folderPath) {
      options.prefix = config.folderPath;
    }

    try {
      const result = await cloudinaryClient.api.resources(options);
      return result;
    } catch (error) {
      strapi.log.error('Error fetching resources from Cloudinary:', error);
      throw error;
    }
  },

  async downloadFile(url: string, tempFilePath: string) {
    try {
      fs.ensureDirSync(path.dirname(tempFilePath));

      const response = await axios({
        method: 'GET',
        url,
        responseType: 'stream',
      });

      const writer = fs.createWriteStream(tempFilePath);
      response.data.pipe(writer);

      return new Promise<void>((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    } catch (error) {
      strapi.log.error(`Error downloading file from ${url}:`, error);
      throw error;
    }
  },

  getFileNameFromUrl(url: string): string {
    const urlParts = url.split('/');
    let fileName = urlParts[urlParts.length - 1];

    // Remove any query parameters
    const queryParamIndex = fileName.indexOf('?');
    if (queryParamIndex !== -1) {
      fileName = fileName.substring(0, queryParamIndex);
    }

    return fileName;
  },

  getMimeType(fileName: string): string {
    const extension = path.extname(fileName).toLowerCase();

    const extensionMimeTypeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };

    return extensionMimeTypeMap[extension] || 'application/octet-stream';
  },

  async uploadToMediaLibrary(filePath: string, fileName: string, fileInfo: CloudinaryResource) {
    try {
      const fileStats = await fs.stat(filePath);

      // Use internal upload API
      const uploadResponse =  await strapi.plugin('upload').service('upload').upload({
        data: {
          fileInfo: {
            name: fileInfo.public_id,
            alternativeText: fileInfo.public_id || '',
            caption: fileInfo.public_id || '',
            hash: fileInfo.asset_id,
          },
        },
        files: {
          filepath: filePath, // Using filePath as filepath parameter
          originalFilename: fileInfo.public_id,
          mimetype: this.getMimeType(fileName),
          size: fileStats.size,
        },
      });

      // await strapi.plugin('upload').service('upload').upload({
      //   files: {
      //     filepath: buffer, // Using buffer as filepath parameter
      //     originalFilename: fileMetadata.name, // Using originalFilename instead of name
      //     mimetype: fileMetadata.mime, // Using mimetype instead of type
      //     size: fileMetadata.size,
      //   },
      // });

      return uploadResponse;
    } catch (error) {
      strapi.log.error(`Error uploading file ${fileName} to Strapi:`, error);
      throw error;
    }
  },

  async syncCloudinaryMedia(): Promise<SyncStats> {
    const stats: SyncStats = {
      processed: 0,
      uploaded: 0,
      skipped: 0,
      errors: [],
    };

    const config = this.getConfig();
    fs.ensureDirSync(TEMP_DIR);

    let hasMore = true;
    let nextCursor: string | null = null;

    try {
      while (hasMore) {
        const result = await this.getCloudinaryResources(nextCursor);
        const { resources, next_cursor } = result;

        if (resources && resources.length > 0) {
          for (const resource of resources) {
            stats.processed++;

            try {
              // Check if file already exists in media library by checking cloudinaryId
              const existingFiles = await strapi.query('plugin::upload.file').findMany({
                where: {
                  caption: resource.public_id,
                },
              });

              if (existingFiles.length > 0 && !config.overwrite) {
                strapi.log.info(`File with public_id ${resource.public_id} already exists. Skipping.`);
                stats.skipped++;
                continue;
              }

              // Download the file from Cloudinary
              const url = resource.secure_url ?? resource.url;
              const fileName = this.getFileNameFromUrl(url);
              const tempFilePath = path.join(TEMP_DIR, fileName);

              await this.downloadFile(url, tempFilePath);

              // Upload to Strapi media library
              const mappedResource: CloudinaryResource = {
                ...resource,
                display_name: resource.public_id, // Map display_name to public_id or another appropriate value
                asset_id: resource.asset_id || '', // Ensure asset_id is provided or default to an empty string
              };
              await this.uploadToMediaLibrary(tempFilePath, fileName, mappedResource);

              // Clean up temp file
              await fs.remove(tempFilePath);

              stats.uploaded++;
              strapi.log.info(`Successfully synced file ${resource.public_id}`);
            } catch (error: any) {
              stats.errors.push({
                public_id: resource.public_id,
                error: error.message || 'Unknown error',
              });
              strapi.log.error(`Error syncing file ${resource.public_id}:`, error);
            }
          }
        }

        if (next_cursor) {
          nextCursor = next_cursor;
          hasMore = false;
        } else {
          hasMore = false;
        }
      }

      return stats;
    } catch (error) {
      strapi.log.error('Error syncing Cloudinary media:', error);
      throw error;
    } finally {
      // Clean up temp directory
      try {
        await fs.remove(TEMP_DIR);
      } catch (cleanupErr) {
        strapi.log.error('Error cleaning up temp directory:', cleanupErr);
      }
    }
  },
});

export default service;
