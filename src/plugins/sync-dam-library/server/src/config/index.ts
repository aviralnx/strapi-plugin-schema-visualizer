export default {
  default: {
    cloudName: '',
    apiKey: '',
    apiSecret: '',
    resourceType: 'image',
    folderPath: '',
    maxResults: 50,
    overwrite: false,
    syncInterval: 0,
  },
  validator(config) {
    if (!config.cloudName) {
      throw new Error('Cloudinary cloud name is required');
    }
    if (!config.apiKey) {
      throw new Error('Cloudinary API key is required');
    }
    if (!config.apiSecret) {
      throw new Error('Cloudinary API secret is required');
    }

    const validResourceTypes = ['image', 'video', 'raw', 'auto'];
    if (config.resourceType && !validResourceTypes.includes(config.resourceType)) {
      throw new Error(`Resource type must be one of: ${validResourceTypes.join(', ')}`);
    }
  },
};
