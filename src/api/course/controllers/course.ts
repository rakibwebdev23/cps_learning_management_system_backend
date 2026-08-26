import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::course.course', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in.');
    }

    const userRole = user.user_role;

    if (userRole === 'STUDENT') {
      return ctx.forbidden('Students cannot create courses.');
    }

    // If instructor, automatically associate the course with their account
    if (userRole === 'INSTRUCTOR') {
      ctx.request.body.data = {
        ...ctx.request.body.data,
        instructor: user.documentId,
      };
    }

    return await super.create(ctx);
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in.');
    }

    const userRole = user.user_role;

    if (userRole === 'STUDENT') {
      return ctx.forbidden('Students cannot update courses.');
    }

    if (userRole === 'INSTRUCTOR') {
      const { id } = ctx.params; // documentId
      const course = await strapi.documents('api::course.course').findOne({
        documentId: id,
        populate: ['instructor'],
      });

      if (!course) {
        return ctx.notFound('Course not found.');
      }

      if (course.instructor?.documentId !== user.documentId) {
        return ctx.forbidden('You can only update your own courses.');
      }

      // Instructors cannot transfer course ownership
      if (ctx.request.body.data && ctx.request.body.data.instructor) {
        delete ctx.request.body.data.instructor;
      }
    }

    return await super.update(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in.');
    }

    const userRole = user.user_role;

    if (userRole === 'STUDENT') {
      return ctx.forbidden('Students cannot delete courses.');
    }

    if (userRole === 'INSTRUCTOR') {
      const { id } = ctx.params;
      const course = await strapi.documents('api::course.course').findOne({
        documentId: id,
        populate: ['instructor'],
      });

      if (!course) {
        return ctx.notFound('Course not found.');
      }

      if (course.instructor?.documentId !== user.documentId) {
        return ctx.forbidden('You can only delete your own courses.');
      }
    }

    return await super.delete(ctx);
  },
}));
