import type { Core } from '@strapi/strapi';
import { state } from './utils/shared-state';

const destroy = ({ strapi }: { strapi: Core.Strapi }) => {
  // Clean up any scheduled tasks when the plugin is disabled
  if (state.syncInterval) {
    strapi.log.info('Cleaning up Cloudinary sync interval');
    clearInterval(state.syncInterval);
  }
};

export default destroy;
