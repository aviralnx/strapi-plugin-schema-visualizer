import { useFetchClient } from '@strapi/strapi/admin';
import { PLUGIN_ID } from '../pluginId';

export const useS3MediaSyncAPI = () => {
  const { get, post } = useFetchClient();

  /**
   * Triggers the S3 to Media Library synchronization process
   */
  const syncS3Media = async () => {
    try {
      const { data } = await post(`/${PLUGIN_ID}/sync`);
      return data;
    } catch (error) {
      console.error('Error syncing S3 media:', error);
      throw error;
    }
  };

  /**
   * Gets the sync status and statistics
   */
  const getSyncStatus = async () => {
    try {
      const { data } = await get(`/${PLUGIN_ID}/status`);
      return data;
    } catch (error) {
      console.error('Error getting sync status:', error);
      throw error;
    }
  };

  /**
   * Gets the plugin configuration
   */
  const getConfig = async () => {
    try {
      const { data } = await get(`/${PLUGIN_ID}/config`);
      return data;
    } catch (error) {
      console.error('Error getting plugin configuration:', error);
      throw error;
    }
  };

  return {
    syncS3Media,
    getSyncStatus,
    getConfig,
  };
};
