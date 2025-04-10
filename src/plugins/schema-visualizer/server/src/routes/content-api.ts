export default [
  {
    method: 'GET',
    path: '/',
    // name of the controller file & the method.
    handler: 'controller.index',
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: 'GET',
    path: '/er-data',
    handler: 'controller.getEntitiesRelationData',
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: 'GET',
    path: '/tr-data',
    handler: 'controller.getTablesRelationData',
    config: {
      policies: [],
      auth: false,
    },
  },
];
