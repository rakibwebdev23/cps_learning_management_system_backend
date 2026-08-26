import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::enrollment.enrollment', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const userRole = user.user_role;

    if (userRole === 'STUDENT') {
      ctx.request.body.data = {
        ...ctx.request.body.data,
        student: user.documentId,
        enrolledAt: new Date().toISOString(),
        status: 'ACTIVE',
      };
    } else if (userRole !== 'ADMIN') {
      return ctx.forbidden('Only students or admins can enroll in courses.');
    }

    return await super.create(ctx);
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const userRole = user.user_role;

    if (userRole === 'STUDENT') {
      const { id } = ctx.params;
      const enrollment: any = await strapi.documents('api::enrollment.enrollment').findOne({
        documentId: id,
        populate: ['student'],
      });

      if (!enrollment) {
        return ctx.notFound('Enrollment not found.');
      }

      if (enrollment.student?.documentId !== user.documentId) {
        return ctx.forbidden('You can only update your own enrollments.');
      }

      ctx.request.body.data = {
        status: ctx.request.body.data.status,
      };

      if (ctx.request.body.data.status === 'COMPLETED' || ctx.request.body.data.status === 'DROPPED') {
        ctx.request.body.data.completedAt = new Date().toISOString();
      }
    } else if (userRole !== 'ADMIN') {
      return ctx.forbidden('Only students or admins can update enrollments.');
    }

    return await super.update(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const userRole = user.user_role;

    if (userRole !== 'ADMIN') {
      return ctx.forbidden('Only admins can delete enrollments.');
    }

    return await super.delete(ctx);
  },

  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const userRole = user.user_role;
    const queryFilters = (ctx.query.filters || {}) as Record<string, any>;

    if (userRole === 'STUDENT') {
      ctx.query.filters = {
        ...queryFilters,
        student: { documentId: user.documentId },
      };
    } else if (userRole === 'INSTRUCTOR') {
      ctx.query.filters = {
        ...queryFilters,
        course: {
          instructor: { documentId: user.documentId },
        },
      };
    } else if (userRole !== 'ADMIN' && userRole !== 'CONTENT_MANAGER') {
      return ctx.forbidden();
    }

    return await super.find(ctx);
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const { id } = ctx.params;
    const enrollment: any = await strapi.documents('api::enrollment.enrollment').findOne({
      documentId: id,
      populate: ['student', 'course.instructor'],
    });

    if (!enrollment) {
      return ctx.notFound('Enrollment not found.');
    }

    const userRole = user.user_role;

    if (userRole === 'STUDENT') {
      if (enrollment.student?.documentId !== user.documentId) {
        return ctx.forbidden('You can only view your own enrollments.');
      }
    } else if (userRole === 'INSTRUCTOR') {
      if (enrollment.course?.instructor?.documentId !== user.documentId) {
        return ctx.forbidden('You can only view enrollments of your own courses.');
      }
    } else if (userRole !== 'ADMIN' && userRole !== 'CONTENT_MANAGER') {
      return ctx.forbidden();
    }

    return await super.findOne(ctx);
  },
}));
