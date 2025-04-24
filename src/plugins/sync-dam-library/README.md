# Cloudinary Media Sync Plugin for Strapi

A Strapi plugin to synchronize media assets from Cloudinary with your Strapi media library.

## Features

- Sync media assets from Cloudinary to Strapi media library
- Support for images, videos, and raw files
- Filter by folder in Cloudinary
- Option to overwrite existing files
- Automatic synchronization at configured intervals
- Manual synchronization through admin UI

## Installation

```bash
cd my-strapi-project
npm install cloudinary-media-sync
```

## Configuration

### Prerequisites

1. A Cloudinary account with API credentials
2. Strapi v5.x

### Setup

1. Create a `.env` file in your Strapi project root with the following environment variables:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_RESOURCE_TYPE=image # Optional: 'image', 'video', 'raw', or 'auto'
CLOUDINARY_FOLDER_PATH=folder_name # Optional: specify a folder to sync from
CLOUDINARY_MAX_RESULTS=50 # Optional: max number of assets to sync in one request
CLOUDINARY_OVERWRITE_FILES=false # Optional: overwrite existing files
CLOUDINARY_SYNC_INTERVAL=0 # Optional: automatic sync interval in minutes (0 means manual only)
```

2. Enable the plugin in `config/plugins.js`:

```js
module.exports = {
  'sync-dam-library': {
    enabled: true,
    config: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
      resourceType: process.env.CLOUDINARY_RESOURCE_TYPE || 'image',
      folderPath: process.env.CLOUDINARY_FOLDER_PATH || '',
      maxResults: parseInt(process.env.CLOUDINARY_MAX_RESULTS || '50'),
      overwrite: process.env.CLOUDINARY_OVERWRITE_FILES === 'true',
      syncInterval: parseInt(process.env.CLOUDINARY_SYNC_INTERVAL || '0'),
    },
  },
};
```

## Usage

1. After installation and configuration, restart your Strapi server
2. In the Strapi admin panel, navigate to "Plugins" > "Cloudinary Media Sync"
3. Click "Sync Media from Cloudinary" to start the synchronization process

### Automatic Sync

If you set a sync interval (in minutes) using the `CLOUDINARY_SYNC_INTERVAL` environment variable, the plugin will automatically run the sync process at the specified interval.

## API Endpoints

The plugin exposes the following API endpoints:

- `GET /sync-dam-library/config` - Get the current plugin configuration
- `GET /sync-dam-library/resources` - Get resources from Cloudinary
- `POST /sync-dam-library/sync` - Trigger a manual sync from Cloudinary to Strapi

## Development

### Prerequisites

- Node.js
- Yarn (or npm)
- A Strapi project

### Setup

1. Clone this repository
2. Link the plugin to your Strapi project
3. Run `yarn build` or `npm run build`
4. Restart your Strapi project

## License

MIT
