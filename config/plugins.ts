export default ({ env }) => ({
  // 'schema-visualizer': {
  //   enabled: false,
  //   resolve: './src/plugins/schema-visualizer'
  // },
  // 'schema-visualizer-v2': {
  //   enabled: true,
  //   resolve: './src/plugins/schema-visualizer-v2'
  // },
  // 'imgix': {
  //   enabled: true,
  //   config: {
  //       mediaLibrarySourceUrl: 'http://localhost:1337/uploads', // Example: https://my-awss3-bucket-for-strapi.s3.eu-central-1.amazonaws.com/ or https://mydomain.com/uploads/
  //       apiKey: 'ak_6a4ed87409431836aaae10f642d1a6ae160d7255e4d831d3441f8ec8b5616517',
  //       source: {
  //           type: 'other', // 'other' or 'webfolder'. Default: 'other'
  //           id: '6800ccc2862ca866258f6a2d', // Example:
  //           url: 'https://plugin-test-strapi.imgix.net', // Example: https://sdk-test.imgix.net
  //       },
  //   },
  // },
  // 's3-media-sync': {
  // enabled: true,
  // resolve: './src/plugins/s3-media-sync',
  // config: {
  //   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  //   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  //   region: process.env.AWS_REGION,
  //   bucket: process.env.AWS_BUCKET_NAME,
  //   prefix: process.env.AWS_PREFIX || '',  // Optional
  //   overwrite: process.env.AWS_OVERWRITE_FILES === 'true',  // Optional
  //   maxConcurrentUploads: parseInt(process.env.AWS_MAX_CONCURRENT_UPLOADS || '5'),  // Optional
  // }
  // },
  // 'sync-dam-library': {
  //   enabled: true,
  //   resolve: './src/plugins/sync-dam-library',
  //   config: {
  //     cloudName: 'dg6mgaxri',
  //     apiKey: '594392422952868',
  //     apiSecret: 'Uzr2n0l3mUdZLJFHu1zjqep1_d8',
  //     resourceType: process.env.CLOUDINARY_RESOURCE_TYPE || 'image', // 'image', 'video', 'raw', or 'auto'
  //     folderPath: process.env.CLOUDINARY_FOLDER_PATH || '', // Optional: specify a folder to sync from
  //     maxResults: parseInt(process.env.CLOUDINARY_MAX_RESULTS || '50'), // Optional: max number of assets to sync in one request
  //     overwrite: process.env.CLOUDINARY_OVERWRITE_FILES === 'true', // Optional: overwrite existing files
  //     syncInterval: parseInt(process.env.CLOUDINARY_SYNC_INTERVAL || '0'), // Optional: 0 means manual sync only
  //   },
  // },
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
});
