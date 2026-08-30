import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::course.course', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    
    if (user) {
      const userRole = user.user_role?.toLowerCase();
      
      // assign user by role
      if (userRole === 'instructor') {
        ctx.request.body.data = {
          ...ctx.request.body.data,
          instructor: user.documentId || user.id,
        };
      } else if (userRole === 'content_manager' || userRole === 'admin') {
        ctx.request.body.data = {
          ...ctx.request.body.data,
          content_manager: user.documentId || user.id,
        };
      }
    }

    return await super.create(ctx);
  },

  async find(ctx) {
    ctx.query = {
      ...ctx.query,
      populate: {
        ...(ctx.query.populate as any),
        instructor: {
          fields: ['username'],
        },
      },
    };
    return await super.find(ctx);
  },
  
  async findOne(ctx) {
    ctx.query = {
      ...ctx.query,
      populate: {
        ...(ctx.query.populate as any),
        instructor: {
          fields: ['username'],
        },
      },
    };
    return await super.findOne(ctx);
  }
}));
