export default {
  default: {
    accessKeyId: '',
    secretAccessKey: '',
    region: '',
    bucket: '',
    prefix: '',
    overwrite: false,
    maxConcurrentUploads: 5,
  },
  validator(config) {
    // Add validation for the plugin configuration
    if (!config.accessKeyId) {
      throw new Error('accessKeyId is required');
    }
    if (!config.secretAccessKey) {
      throw new Error('secretAccessKey is required');
    }
    if (!config.region) {
      throw new Error('region is required');
    }
    if (!config.bucket) {
      throw new Error('bucket is required');
    }
  },
};
