export default () => ({
  'schema-visualizer': {
    enabled: false,
    resolve: './src/plugins/schema-visualizer'
  },
  'schema-visualizer-v2': {
    enabled: true,
    resolve: './src/plugins/schema-visualizer-v2'
  },
  'imgix': {
    enabled: true,
    config: {
        mediaLibrarySourceUrl: 'http://localhost:1337/uploads', // Example: https://my-awss3-bucket-for-strapi.s3.eu-central-1.amazonaws.com/ or https://mydomain.com/uploads/
        apiKey: 'ak_6a4ed87409431836aaae10f642d1a6ae160d7255e4d831d3441f8ec8b5616517',
        source: {
            type: 'other', // 'other' or 'webfolder'. Default: 'other'
            id: '6800ccc2862ca866258f6a2d', // Example:
            url: 'https://plugin-test-strapi.imgix.net', // Example: https://sdk-test.imgix.net
        },
    },
  },
  's3-media-sync': {
  enabled: true,
  resolve: './src/plugins/s3-media-sync',
  config: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    bucket: process.env.AWS_BUCKET_NAME,
    prefix: process.env.AWS_PREFIX || '',  // Optional
    overwrite: process.env.AWS_OVERWRITE_FILES === 'true',  // Optional
    maxConcurrentUploads: parseInt(process.env.AWS_MAX_CONCURRENT_UPLOADS || '5'),  // Optional
  }
}
});
