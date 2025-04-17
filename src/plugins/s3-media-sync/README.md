# S3 Media Sync for Strapi

A Strapi plugin to sync files from an AWS S3 bucket directly into your Strapi media library.

## Features

- One-click synchronization of S3 bucket contents to Strapi media library
- Configurable S3 connection details (AWS credentials, region, bucket)
- Optional path prefix filtering to sync specific folders
- Skip or overwrite existing files option
- Detailed sync statistics and tracking

## Installation

```bash
# Using npm
npm install s3-media-sync

# Using yarn
yarn add s3-media-sync
```

## Configuration

Add the following configuration to your `config/plugins.js` file:

```js
module.exports = {
  // ...
  's3-media-sync': {
    enabled: true,
    config: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
      bucket: process.env.AWS_BUCKET,
      prefix: 'optional/path/prefix',  // Optional
      overwrite: false,  // Optional, defaults to false
      maxConcurrentUploads: 5,  // Optional, defaults to 5
    },
  },
  // ...
};
```

For security, we recommend using environment variables for your AWS credentials.

## Usage

Once installed and configured, the plugin will add a new section in your Strapi admin panel.

1. Navigate to the S3 Media Sync plugin in the Strapi admin sidebar
2. Click the "Sync S3 Files" button to start the sync process
3. The plugin will import all files from the configured S3 bucket into your Strapi media library
4. View sync statistics on the plugin homepage

## Troubleshooting

### Permission Issues

Ensure your AWS credentials have the necessary permissions to access the S3 bucket:

- `s3:ListBucket`
- `s3:GetObject`

### File Size Limitations

Be aware of Strapi's file size limitations when syncing large files. You may need to adjust your Strapi configuration to accommodate large files.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](LICENSE)
