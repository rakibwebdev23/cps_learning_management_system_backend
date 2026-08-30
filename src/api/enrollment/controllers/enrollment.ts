import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::enrollment.enrollment', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in to purchase a course');
    }

    let fullUser = null;
    if (user.documentId) {
      fullUser = await strapi.documents('plugin::users-permissions.user').findOne({
        documentId: user.documentId,
        populate: ['role'],
      });
    } else if (user.id) {
      fullUser = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { id: user.id },
        populate: ['role'],
      });
    }

    const roleType = fullUser?.role?.type?.toLowerCase() || fullUser?.role?.name?.toLowerCase() || user.user_role?.toLowerCase();

    if (roleType === 'student') {
      ctx.request.body.data = {
        ...(ctx.request.body.data || {}),
        student: user.documentId || user.id,
      };
    }
    
    return await super.create(ctx);
  }
}));
