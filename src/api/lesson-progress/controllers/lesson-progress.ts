import { factories } from '@strapi/strapi';

function getRelationId(relationData: any): string | null {
  if (!relationData) return null;
  if (typeof relationData === 'string') return relationData;
  if (typeof relationData === 'object') {
    if (relationData.connect && relationData.connect.length > 0) {
      const first = relationData.connect[0];
      return typeof first === 'object' ? first.documentId : first;
    }
    if (relationData.set && relationData.set.length > 0) {
      const first = relationData.set[0];
      return typeof first === 'object' ? first.documentId : first;
    }
    return relationData.documentId || null;
  }
  return null;
}

export default factories.createCoreController('api::lesson-progress.lesson-progress', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const userRole = user.user_role;

    if (userRole === 'STUDENT') {
      const lessonId = getRelationId(ctx.request.body.data?.lesson);
      const courseId = getRelationId(ctx.request.body.data?.course);

      if (!lessonId || !courseId) {
        return ctx.badRequest('Lesson and course must be specified.');
      }

      const enrollment = await strapi.documents('api::enrollment.enrollment').findFirst({
        filters: {
          student: { documentId: user.documentId },
          course: { documentId: courseId },
          status: 'ACTIVE',
        },
      });

      if (!enrollment) {
        return ctx.forbidden('You are not enrolled in this course.');
      }

      ctx.request.body.data = {
        ...ctx.request.body.data,
        student: user.documentId,
      };

      if (ctx.request.body.data.completed) {
        ctx.request.body.data.completedAt = new Date().toISOString();
      }
    } else if (userRole !== 'ADMIN') {
      return ctx.forbidden('Only students or admins can track progress.');
    }

    return await super.create(ctx);
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const userRole = user.user_role;

    if (userRole === 'STUDENT') {
      const { id } = ctx.params;
      const progress: any = await strapi.documents('api::lesson-progress.lesson-progress').findOne({
        documentId: id,
        populate: ['student'],
      });

      if (!progress) {
        return ctx.notFound('Progress record not found.');
      }

      if (progress.student?.documentId !== user.documentId) {
        return ctx.forbidden('You can only update your own progress.');
      }

      ctx.request.body.data = {
        completed: ctx.request.body.data.completed,
      };

      if (ctx.request.body.data.completed) {
        ctx.request.body.data.completedAt = new Date().toISOString();
      } else {
        ctx.request.body.data.completedAt = null;
      }
    } else if (userRole !== 'ADMIN') {
      return ctx.forbidden('Only students or admins can update progress.');
    }

    return await super.update(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    if (user.user_role !== 'ADMIN') {
      return ctx.forbidden('Only admins can delete progress records.');
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
    const progress: any = await strapi.documents('api::lesson-progress.lesson-progress').findOne({
      documentId: id,
      populate: ['student', 'course.instructor'],
    });

    if (!progress) {
      return ctx.notFound('Progress record not found.');
    }

    const userRole = user.user_role;

    if (userRole === 'STUDENT') {
      if (progress.student?.documentId !== user.documentId) {
        return ctx.forbidden('You can only view your own progress.');
      }
    } else if (userRole === 'INSTRUCTOR') {
      if (progress.course?.instructor?.documentId !== user.documentId) {
        return ctx.forbidden('You can only view progress of students in your own courses.');
      }
    } else if (userRole !== 'ADMIN' && userRole !== 'CONTENT_MANAGER') {
      return ctx.forbidden();
    }

    return await super.findOne(ctx);
  },
}));
