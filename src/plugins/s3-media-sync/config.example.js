// Example config for the s3-media-sync plugin

module.exports = ({ env }) => ({
  // ...other plugins
  's3-media-sync': {
    enabled: true,
    config: {
      accessKeyId: env('AWS_ACCESS_KEY_ID'),
      secretAccessKey: env('AWS_SECRET_ACCESS_KEY'),
      region: env('AWS_REGION'),
      bucket: env('AWS_BUCKET_NAME'),
      prefix: env('AWS_PREFIX', ''), // Optional, defaults to empty string (root of bucket)
      overwrite: env.bool('AWS_OVERWRITE_FILES', false), // Optional, defaults to false
      maxConcurrentUploads: env.int('AWS_MAX_CONCURRENT_UPLOADS', 5), // Optional, defaults to 5
    },
  },
  // ...other plugins
});
