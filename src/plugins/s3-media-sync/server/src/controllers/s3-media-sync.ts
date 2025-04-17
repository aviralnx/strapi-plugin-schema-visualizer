import { errors } from '@strapi/utils';

const { ApplicationError } = errors;

/**
 * S3 Media Sync controller
 */
export default {
  /**
   * Sync S3 files to media library
   * @param {object} ctx - Koa context
   */
  async sync(ctx) {
    try {
      const syncService = strapi.plugin('s3-media-sync').service('sync');
      const result = await syncService.syncS3ToMediaLibrary();

      ctx.body = result;
    } catch (error) {
      strapi.log.error('Error in sync controller:', error);
      ctx.throw(500, error.message);
    }
  },

  /**
   * Get sync status
   * @param {object} ctx - Koa context
   */
  async getStatus(ctx) {
    try {
      const syncService = strapi.plugin('s3-media-sync').service('sync');
      const stats = await syncService.getSyncStats();

      ctx.body = stats || {
        success: false,
        totalFiles: 0,
        filesSynced: 0,
        filesSkipped: 0,
        filesErrored: 0,
        lastSync: null,
      };
    } catch (error) {
      strapi.log.error('Error in getStatus controller:', error);
      ctx.body = {
        success: false,
        totalFiles: 0,
        filesSynced: 0,
        filesSkipped: 0,
        filesErrored: 0,
        lastSync: null,
      };
    }
  },

  /**
   * Get plugin configuration
   * @param {object} ctx - Koa context
   */
  async getConfig(ctx) {
    try {
      // Get the plugin configuration accessor function
      const pluginConfig = strapi.plugin('s3-media-sync').config;

      // Return a sanitized version of the config (without secrets)
      const sanitizedConfig = {
        accessKeyId: pluginConfig('accessKeyId') ? '***' : '',
        secretAccessKey: pluginConfig('secretAccessKey') ? '***' : '',
        region: pluginConfig('region'),
        bucket: pluginConfig('bucket'),
        prefix: pluginConfig('prefix'),
        overwrite: pluginConfig('overwrite'),
        maxConcurrentUploads: pluginConfig('maxConcurrentUploads'),
      };

      // Check if the plugin is properly configured
      const isConfigured = !!(
        pluginConfig('accessKeyId') &&
        pluginConfig('secretAccessKey') &&
        pluginConfig('region') &&
        pluginConfig('bucket')
      );

      ctx.body = {
        ...sanitizedConfig,
        isConfigured,
      };
    } catch (error) {
      strapi.log.error('Error in getConfig controller:', error);
      ctx.body = {
        isConfigured: false,
        accessKeyId: '',
        secretAccessKey: '',
        region: '',
        bucket: '',
        prefix: '',
        overwrite: false,
        maxConcurrentUploads: 5,
      };
    }
  },
};
