import type { Core } from '@strapi/strapi';

const controller = ({ strapi }: { strapi: Core.Strapi }) => ({
  index(ctx) {
    ctx.body = strapi
      .plugin('schema-visualizer')
      // the name of the service file & the method.
      .service('service')
      .getWelcomeMessage();
  },
  async getEntitiesRelationData(ctx) {
    const data = await strapi
      .plugin('schema-visualizer')
      .service('service')
      .getEntitiesRelationData();

    if (data) setImmediate(() => strapi.reload());
    ctx.body = data;
  },
  async getTablesRelationData(ctx) {
    const data = await strapi
      .plugin('schema-visualizer')
      .service('service')
      .getTablesRelationData();

    if (data) setImmediate(() => strapi.reload());
    ctx.body = data;
  },
});

export default controller;
