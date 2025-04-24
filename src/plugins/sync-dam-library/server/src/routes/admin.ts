export default [
  {
    method: 'GET',
    path: '/config',
    handler: 'controller.getConfig',
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: 'GET',
    path: '/resources',
    handler: 'controller.getCloudinaryResources',
    config: {
      policies: [],
    },
  },
  {
    method: 'POST',
    path: '/sync',
    handler: 'controller.syncMedia',
    config: {
      policies: [],
    },
  },
];
