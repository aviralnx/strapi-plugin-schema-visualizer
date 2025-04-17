export default [
  {
    method: 'POST',
    path: '/sync',
    handler: 's3-media-sync.sync',
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: 'GET',
    path: '/status',
    handler: 's3-media-sync.getStatus',
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: 'GET',
    path: '/config',
    handler: 's3-media-sync.getConfig',
    config: {
      policies: [],
      auth: false,
    },
  },
];
