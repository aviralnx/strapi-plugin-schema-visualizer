import type { Core } from '@strapi/strapi';
import { state } from './utils/shared-state';

const bootstrap = ({ strapi }: { strapi: Core.Strapi }) => {
  // Get plugin configuration
  const syncInterval = strapi.config.get('plugin.sync-dam-library.syncInterval');

  // If sync interval is configured and greater than 0, set up periodic sync
  if (typeof syncInterval === 'number' && syncInterval > 0) {
    const intervalMs = Number(syncInterval) * 60 * 1000; // Convert minutes to milliseconds

    strapi.log.info(`Setting up Cloudinary sync every ${syncInterval} minutes`);

    // Clear any existing interval first
    if (state.syncInterval) {
      clearInterval(state.syncInterval);
    }

    // Set up the interval
    state.syncInterval = setInterval(async () => {
      try {
        strapi.log.info('Starting scheduled Cloudinary media sync...');
        const result = await strapi.plugin('sync-dam-library').service('service').syncCloudinaryMedia();
        strapi.log.info('Scheduled Cloudinary sync completed:', result);
      } catch (error) {
        strapi.log.error('Error during scheduled Cloudinary sync:', error);
      }
    }, intervalMs);
  }
};

export default bootstrap;
