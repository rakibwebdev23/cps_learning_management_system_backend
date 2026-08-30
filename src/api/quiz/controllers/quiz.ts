import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::quiz.quiz', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (user) {
      ctx.request.body.data = {
        ...ctx.request.body.data,
        created_by: user.documentId || user.id,
      };
    }
    return await super.create(ctx);
  }
}));
