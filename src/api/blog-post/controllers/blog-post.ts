import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::blog-post.blog-post', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (user) {
      ctx.request.body.data = {
        ...ctx.request.body.data,
        author: user.documentId || user.id,
      };
    }
    return await super.create(ctx);
  }
}));
