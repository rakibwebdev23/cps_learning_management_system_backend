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

export default factories.createCoreController('api::question.question', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const userRole = user.user_role;
    if (userRole === 'STUDENT') {
      return ctx.forbidden('Students cannot create questions.');
    }

    if (userRole === 'INSTRUCTOR') {
      const quizId = getRelationId(ctx.request.body.data?.quiz);
      if (!quizId) {
        return ctx.badRequest('A quiz must be specified.');
      }

      const quiz: any = await strapi.documents('api::quiz.quiz').findOne({
        documentId: quizId,
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
        return ctx.forbidden('You can only create questions for your own courses.');
      }
    }

    return await super.create(ctx);
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const userRole = user.user_role;
    if (userRole === 'STUDENT') {
      return ctx.forbidden('Students cannot update questions.');
    }

    if (userRole === 'INSTRUCTOR') {
      const { id } = ctx.params;
      const question: any = await strapi.documents('api::question.question').findOne({
        documentId: id,
        populate: {
          quiz: {
            populate: {
              course: {
                populate: ['instructor'],
              },
            },
          },
        },
      });

      if (!question) {
        return ctx.notFound('Question not found.');
      }

      if (question.quiz?.course?.instructor?.documentId !== user.documentId) {
        return ctx.forbidden('You can only update questions of your own courses.');
      }

      const newQuizId = getRelationId(ctx.request.body.data?.quiz);
      if (newQuizId && newQuizId !== question.quiz?.documentId) {
        const newQuiz: any = await strapi.documents('api::quiz.quiz').findOne({
          documentId: newQuizId,
          populate: {
            course: {
              populate: ['instructor'],
            },
          },
        });
        if (!newQuiz || newQuiz.course?.instructor?.documentId !== user.documentId) {
          return ctx.forbidden('You can only move questions to quizzes of your own courses.');
        }
      }
    }

    return await super.update(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const userRole = user.user_role;
    if (userRole === 'STUDENT') {
      return ctx.forbidden('Students cannot delete questions.');
    }

    if (userRole === 'INSTRUCTOR') {
      const { id } = ctx.params;
      const question: any = await strapi.documents('api::question.question').findOne({
        documentId: id,
        populate: {
          quiz: {
            populate: {
              course: {
                populate: ['instructor'],
              },
            },
          },
        },
      });

      if (!question) {
        return ctx.notFound('Question not found.');
      }

      if (question.quiz?.course?.instructor?.documentId !== user.documentId) {
        return ctx.forbidden('You can only delete questions of your own courses.');
      }
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
        quiz: {
          course: {
            enrollments: {
              student: { documentId: user.documentId },
            },
          },
        },
      };
    } else if (userRole === 'INSTRUCTOR') {
      ctx.query.filters = {
        ...queryFilters,
        quiz: {
          course: {
            instructor: { documentId: user.documentId },
          },
        },
      };
    }

    return await super.find(ctx);
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const { id } = ctx.params;
    const question: any = await strapi.documents('api::question.question').findOne({
      documentId: id,
      populate: {
        quiz: {
          populate: ['course'],
        },
      },
    });

    if (!question) {
      return ctx.notFound('Question not found.');
    }

    const userRole = user.user_role;

    if (userRole === 'STUDENT') {
      const courseId = question.quiz?.course?.documentId;
      if (!courseId) {
        return ctx.forbidden('This question is not associated with any course.');
      }

      const enrollment = await strapi.documents('api::enrollment.enrollment').findFirst({
        filters: {
          student: { documentId: user.documentId },
          course: { documentId: courseId },
        },
      });
      if (!enrollment) {
        return ctx.forbidden('You must be enrolled in this course to view this question.');
      }
    } else if (userRole === 'INSTRUCTOR') {
      const courseId = question.quiz?.course?.documentId;
      if (!courseId) {
        return ctx.forbidden('This question is not associated with any course.');
      }

      const course: any = await strapi.documents('api::course.course').findOne({
        documentId: courseId,
        populate: ['instructor'],
      });
      if (course?.instructor?.documentId !== user.documentId) {
        return ctx.forbidden('You can only view questions of your own courses.');
      }
    }

    return await super.findOne(ctx);
  },
}));
