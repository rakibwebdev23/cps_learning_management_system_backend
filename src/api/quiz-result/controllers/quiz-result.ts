import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::quiz-result.quiz-result', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (user && user.user_role?.toLowerCase() === 'student') {
      ctx.request.body.data = {
        ...ctx.request.body.data,
        student: user.documentId || user.id,
      };
    }
    return await super.create(ctx);
  }
}));
