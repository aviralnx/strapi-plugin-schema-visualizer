module.exports = {
  default: {
    enabled: true,
    config: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
      resourceType: process.env.CLOUDINARY_RESOURCE_TYPE || 'image', // 'image', 'video', 'raw', or 'auto'
      folderPath: process.env.CLOUDINARY_FOLDER_PATH || '', // Optional: specify a folder to sync from
      maxResults: parseInt(process.env.CLOUDINARY_MAX_RESULTS || '50'), // Optional: max number of assets to sync in one request
      overwrite: process.env.CLOUDINARY_OVERWRITE_FILES === 'true', // Optional: overwrite existing files
      syncInterval: parseInt(process.env.CLOUDINARY_SYNC_INTERVAL || '0'), // Optional: 0 means manual sync only
    },
  },
};
