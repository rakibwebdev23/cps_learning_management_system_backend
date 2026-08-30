import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::course.course', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    
    if (user) {
      const userId = user.documentId || user.id;

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

      const roleType = (fullUser?.role?.type || fullUser?.role?.name || user.user_role || '').toLowerCase();
      
      const bodyData = ctx.request.body?.data || {};

      // Automatically set instructor to logged-in user when creating course
      ctx.request.body.data = {
        ...bodyData,
        instructor: bodyData.instructor || userId,
      };

      if (roleType === 'content_manager' || roleType === 'admin') {
        ctx.request.body.data.content_manager = bodyData.content_manager || userId;
      }
    }

    return await super.create(ctx);
  },

  async find(ctx) {
    const defaultInstructorPopulate = {
      fields: ['username', 'email', 'avatar'],
    };

    if (!ctx.query.populate) {
      ctx.query.populate = {
        instructor: defaultInstructorPopulate,
      };
    } else if (typeof ctx.query.populate === 'object' && !Array.isArray(ctx.query.populate)) {
      ctx.query.populate = {
        ...ctx.query.populate,
        instructor: (ctx.query.populate as any).instructor || defaultInstructorPopulate,
      };
    }

    return await super.find(ctx);
  },
  
  async findOne(ctx) {
    const defaultInstructorPopulate = {
      fields: ['username', 'email', 'avatar'],
    };

    if (!ctx.query.populate) {
      ctx.query.populate = {
        instructor: defaultInstructorPopulate,
      };
    } else if (typeof ctx.query.populate === 'object' && !Array.isArray(ctx.query.populate)) {
      ctx.query.populate = {
        ...ctx.query.populate,
        instructor: (ctx.query.populate as any).instructor || defaultInstructorPopulate,
      };
    }

    return await super.findOne(ctx);
  }
}));
