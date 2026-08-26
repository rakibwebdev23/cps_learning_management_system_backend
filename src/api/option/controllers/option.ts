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

export default factories.createCoreController('api::option.option', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const userRole = user.user_role;
    if (userRole === 'STUDENT') {
      return ctx.forbidden('Students cannot create options.');
    }

    if (userRole === 'INSTRUCTOR') {
      const questionId = getRelationId(ctx.request.body.data?.question);
      if (!questionId) {
        return ctx.badRequest('A question must be specified.');
      }

      const question: any = await strapi.documents('api::question.question').findOne({
        documentId: questionId,
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
        return ctx.forbidden('You can only create options for questions in your own courses.');
      }
    }

    return await super.create(ctx);
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const userRole = user.user_role;
    if (userRole === 'STUDENT') {
      return ctx.forbidden('Students cannot update options.');
    }

    if (userRole === 'INSTRUCTOR') {
      const { id } = ctx.params;
      const option: any = await strapi.documents('api::option.option').findOne({
        documentId: id,
        populate: {
          question: {
            populate: {
              quiz: {
                populate: {
                  course: {
                    populate: ['instructor'],
                  },
                },
              },
            },
          },
        },
      });

      if (!option) {
        return ctx.notFound('Option not found.');
      }

      if (option.question?.quiz?.course?.instructor?.documentId !== user.documentId) {
        return ctx.forbidden('You can only update options of your own courses.');
      }

      const newQuestionId = getRelationId(ctx.request.body.data?.question);
      if (newQuestionId && newQuestionId !== option.question?.documentId) {
        const newQuestion: any = await strapi.documents('api::question.question').findOne({
          documentId: newQuestionId,
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
        if (!newQuestion || newQuestion.quiz?.course?.instructor?.documentId !== user.documentId) {
          return ctx.forbidden('You can only move options to questions in your own courses.');
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
      return ctx.forbidden('Students cannot delete options.');
    }

    if (userRole === 'INSTRUCTOR') {
      const { id } = ctx.params;
      const option: any = await strapi.documents('api::option.option').findOne({
        documentId: id,
        populate: {
          question: {
            populate: {
              quiz: {
                populate: {
                  course: {
                    populate: ['instructor'],
                  },
                },
              },
            },
          },
        },
      });

      if (!option) {
        return ctx.notFound('Option not found.');
      }

      if (option.question?.quiz?.course?.instructor?.documentId !== user.documentId) {
        return ctx.forbidden('You can only delete options of your own courses.');
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
        question: {
          quiz: {
            course: {
              enrollments: {
                student: { documentId: user.documentId },
              },
            },
          },
        },
      };
    } else if (userRole === 'INSTRUCTOR') {
      ctx.query.filters = {
        ...queryFilters,
        question: {
          quiz: {
            course: {
              instructor: { documentId: user.documentId },
            },
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
    const option: any = await strapi.documents('api::option.option').findOne({
      documentId: id,
      populate: {
        question: {
          populate: {
            quiz: {
              populate: ['course'],
            },
          },
        },
      },
    });

    if (!option) {
      return ctx.notFound('Option not found.');
    }

    const userRole = user.user_role;

    if (userRole === 'STUDENT') {
      const courseId = option.question?.quiz?.course?.documentId;
      if (!courseId) {
        return ctx.forbidden('This option is not associated with any course.');
      }

      const enrollment = await strapi.documents('api::enrollment.enrollment').findFirst({
        filters: {
          student: { documentId: user.documentId },
          course: { documentId: courseId },
        },
      });
      if (!enrollment) {
        return ctx.forbidden('You must be enrolled in this course to view this option.');
      }
    } else if (userRole === 'INSTRUCTOR') {
      const courseId = option.question?.quiz?.course?.documentId;
      if (!courseId) {
        return ctx.forbidden('This option is not associated with any course.');
      }

      const course: any = await strapi.documents('api::course.course').findOne({
        documentId: courseId,
        populate: ['instructor'],
      });
      if (course?.instructor?.documentId !== user.documentId) {
        return ctx.forbidden('You can only view options of your own courses.');
      }
    }

    return await super.findOne(ctx);
  },
}));
