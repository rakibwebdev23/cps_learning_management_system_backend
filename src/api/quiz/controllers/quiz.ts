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

export default factories.createCoreController('api::quiz.quiz', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const userRole = user.user_role;
    if (userRole === 'student') {
      return ctx.forbidden('Students cannot create quizzes.');
    }

    if (userRole === 'instructor') {
      const courseId = getRelationId(ctx.request.body.data?.course);
      if (!courseId) {
        return ctx.badRequest('A course must be specified.');
      }

      const course: any = await strapi.documents('api::course.course').findOne({
        documentId: courseId,
        populate: ['instructor'],
      });

      if (!course) {
        return ctx.notFound('Course not found.');
      }

      if (course.instructor?.documentId !== user.documentId) {
        return ctx.forbidden('You can only create quizzes for your own courses.');
      }

      ctx.request.body.data = {
        ...ctx.request.body.data,
        created_by: user.documentId,
      };
    }

    return await super.create(ctx);
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const userRole = user.user_role;
    if (userRole === 'student') {
      return ctx.forbidden('Students cannot update quizzes.');
    }

    if (userRole === 'instructor') {
      const { id } = ctx.params;
      const quiz: any = await strapi.documents('api::quiz.quiz').findOne({
        documentId: id,
        populate: {
          course: {
            populate: ['instructor'],
          },
        },
      });

      if (!quiz) {
        return ctx.notFound('Quiz not found.');
      }

      if (quiz.course?.instructor?.documentId !== user.documentId) {
        return ctx.forbidden('You can only update quizzes of your own courses.');
      }

      const newCourseId = getRelationId(ctx.request.body.data?.course);
      if (newCourseId && newCourseId !== quiz.course?.documentId) {
        const newCourse: any = await strapi.documents('api::course.course').findOne({
          documentId: newCourseId,
          populate: ['instructor'],
        });
        if (!newCourse || newCourse.instructor?.documentId !== user.documentId) {
          return ctx.forbidden('You can only move quizzes to your own courses.');
        }
      }
    }

    return await super.update(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const userRole = user.user_role;
    if (userRole === 'student') {
      return ctx.forbidden('Students cannot delete quizzes.');
    }

    if (userRole === 'instructor') {
      const { id } = ctx.params;
      const quiz: any = await strapi.documents('api::quiz.quiz').findOne({
        documentId: id,
        populate: {
          course: {
            populate: ['instructor'],
          },
        },
      });

      if (!quiz) {
        return ctx.notFound('Quiz not found.');
      }

      if (quiz.course?.instructor?.documentId !== user.documentId) {
        return ctx.forbidden('You can only delete quizzes of your own courses.');
      }
    }

    return await super.delete(ctx);
  },

  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const userRole = user.user_role;
    const queryFilters = (ctx.query.filters || {}) as Record<string, any>;

    if (userRole === 'student') {
      ctx.query.filters = {
        ...queryFilters,
        course: {
          enrollments: {
            student: { documentId: user.documentId },
          },
        },
      };
    } else if (userRole === 'instructor') {
      ctx.query.filters = {
        ...queryFilters,
        course: {
          instructor: { documentId: user.documentId },
        },
      };
    }

    return await super.find(ctx);
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const { id } = ctx.params;
    const quiz: any = await strapi.documents('api::quiz.quiz').findOne({
      documentId: id,
      populate: ['course'],
    });

    if (!quiz) {
      return ctx.notFound('Quiz not found.');
    }

    const userRole = user.user_role;

    if (userRole === 'student') {
      const courseId = quiz.course?.documentId;
      if (!courseId) {
        return ctx.forbidden('This quiz is not associated with a course.');
      }

      const enrollment = await strapi.documents('api::enrollment.enrollment').findFirst({
        filters: {
          student: { documentId: user.documentId },
          course: { documentId: courseId },
        },
      });
      if (!enrollment) {
        return ctx.forbidden('You must be enrolled in this course to view this quiz.');
      }
    } else if (userRole === 'instructor') {
      const courseId = quiz.course?.documentId;
      if (!courseId) {
        return ctx.forbidden('This quiz is not associated with a course.');
      }

      const course: any = await strapi.documents('api::course.course').findOne({
        documentId: courseId,
        populate: ['instructor'],
      });
      if (course?.instructor?.documentId !== user.documentId) {
        return ctx.forbidden('You can only view quizzes of your own courses.');
      }
    }

    return await super.findOne(ctx);
  },
}));
