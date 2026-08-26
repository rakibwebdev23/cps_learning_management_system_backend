import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::quiz-answer.quiz-answer', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    if (user.user_role !== 'ADMIN') {
      return ctx.forbidden('Quiz answers can only be created automatically during quiz submission.');
    }

    return await super.create(ctx);
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    if (user.user_role !== 'ADMIN') {
      return ctx.forbidden('Quiz answers cannot be modified.');
    }

    return await super.update(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    if (user.user_role !== 'ADMIN') {
      return ctx.forbidden('Quiz answers cannot be deleted.');
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
        quiz_result: {
          student: { documentId: user.documentId },
        },
      };
    } else if (userRole === 'INSTRUCTOR') {
      ctx.query.filters = {
        ...queryFilters,
        quiz_result: {
          quiz: {
            course: {
              instructor: { documentId: user.documentId },
            },
          },
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
    const answer: any = await strapi.documents('api::quiz-answer.quiz-answer').findOne({
      documentId: id,
      populate: ['quiz_result.student', 'quiz_result.quiz.course.instructor'],
    });

    if (!answer) {
      return ctx.notFound('Quiz answer not found.');
    }

    const userRole = user.user_role;

    if (userRole === 'STUDENT') {
      if (answer.quiz_result?.student?.documentId !== user.documentId) {
        return ctx.forbidden('You can only view your own quiz answers.');
      }
    } else if (userRole === 'INSTRUCTOR') {
      if (answer.quiz_result?.quiz?.course?.instructor?.documentId !== user.documentId) {
        return ctx.forbidden('You can only view quiz answers for your own courses.');
      }
    } else if (userRole !== 'ADMIN' && userRole !== 'CONTENT_MANAGER') {
      return ctx.forbidden();
    }

    return await super.findOne(ctx);
  },
}));
