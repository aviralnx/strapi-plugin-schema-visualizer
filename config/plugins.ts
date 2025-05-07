export default ({ env }) => ({
  email: {
    config: {
      provider: 'sendgrid',
      providerOptions: {
        apiKey: env('SENDGRID_API_KEY'),
      },
      settings: {
        defaultFrom: 'aviral.swarnkar@successive.tech',
        defaultReplyTo: 'aviral.swarnkar@successive.tech',
        testAddress: 'aviral.swarnkar@successive.tech',
      },
    },
  },
  'sync-dam-library': {
    enabled: true,
    resolve: './src/plugins/sync-dam-library',
    config: {
      cloudName: process.env.DAM_CLOUDNAME,
      apiKey: process.env.DAM_API_KEY,
      apiSecret: process.env.DAM_SECRET,
      resourceType: process.env.CLOUDINARY_RESOURCE_TYPE || 'image', // 'image', 'video', 'raw', or 'auto'
      folderPath: process.env.CLOUDINARY_FOLDER_PATH || '', // Optional: specify a folder to sync from
      maxResults: parseInt(process.env.CLOUDINARY_MAX_RESULTS || '50'), // Optional: max number of assets to sync in one request
      overwrite: process.env.CLOUDINARY_OVERWRITE_FILES === 'true', // Optional: overwrite existing files
      syncInterval: parseInt(process.env.CLOUDINARY_SYNC_INTERVAL || '0'), // Optional: 0 means manual sync only
    },
  },
});
