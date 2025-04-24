import { useFetchClient } from '@strapi/strapi/admin';
import { PLUGIN_ID } from '../pluginId';

export const useCloudinarySyncAPI = () => {
  const { get, post } = useFetchClient();

  /**
   * Get the plugin configuration
   */
  const getConfig = async () => {
    try {
      const { data } = await get(`/${PLUGIN_ID}/config`);
      console.debug('🚀 ~ getConfig ~ data:', data)
      return data;
    } catch (error) {
      console.error('Error fetching configuration:', error);
      throw error;
    }
  };

  /**
   * Get resources from Cloudinary
   * @param nextCursor - Optional cursor for pagination
   */
  const getCloudinaryResources = async (nextCursor = null) => {
    try {
      const params = nextCursor ? `?next_cursor=${nextCursor}` : '';
      const { data } = await get(`/${PLUGIN_ID}/resources${params}`);
      return data;
    } catch (error) {
      console.error('Error fetching Cloudinary resources:', error);
      throw error;
    }
  };

  /**
   * Trigger media synchronization from Cloudinary to Strapi
   */
  const syncMedia = async () => {
    try {
      const { data } = await post(`/${PLUGIN_ID}/sync`);
      return data;
    } catch (error) {
      console.error('Error syncing media:', error);
      throw error;
    }
  };

  return {
    getConfig,
    getCloudinaryResources,
    syncMedia,
  };
};
