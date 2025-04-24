import type { Core } from '@strapi/strapi';

const controller = ({ strapi }: { strapi: Core.Strapi }) => ({
  index(ctx) {
    ctx.body = strapi
      .plugin('sync-dam-library')
      .service('service')
      .getWelcomeMessage();
  },

  async getConfig(ctx) {
    try {
      const config = strapi
        .plugin('sync-dam-library')
        .service('service')
        .getConfig();

      ctx.body = config;
    } catch (err) {
      ctx.throw(500, err.message);
    }
  },

  async syncMedia(ctx) {
    try {
      const result = await strapi
        .plugin('sync-dam-library')
        .service('service')
        .syncCloudinaryMedia();

      ctx.body = result;
    } catch (err) {
      ctx.throw(500, err.message);
    }
  },

  async getCloudinaryResources(ctx) {
    try {
      const nextCursor = ctx.query.next_cursor || null;
      const result = await strapi
        .plugin('sync-dam-library')
        .service('service')
        .getCloudinaryResources(nextCursor);

      ctx.body = result;
    } catch (err) {
      ctx.throw(500, err.message);
    }
  },
});

export default controller;
