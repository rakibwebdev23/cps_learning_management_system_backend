import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::quiz-result.quiz-result', ({ strapi }) => ({
  async submit(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const userRole = user.user_role;
    if (userRole !== 'STUDENT' && userRole !== 'ADMIN') {
      return ctx.forbidden('Only students or admins can submit quiz results.');
    }

    const { quiz: quizId, answers } = ctx.request.body.data || {};
    if (!quizId || !Array.isArray(answers)) {
      return ctx.badRequest('Quiz and answers are required.');
    }

    const quiz: any = await strapi.documents('api::quiz.quiz').findOne({
      documentId: quizId,
      populate: ['course'],
    });

    if (!quiz) {
      return ctx.notFound('Quiz not found.');
    }

    if (userRole === 'STUDENT') {
      const enrollment = await strapi.documents('api::enrollment.enrollment').findFirst({
        filters: {
          student: { documentId: user.documentId },
          course: { documentId: quiz.course?.documentId },
          status: 'ACTIVE',
        },
      });

      if (!enrollment) {
        return ctx.forbidden('You must be actively enrolled in this course to take this quiz.');
      }
    }

    const studentId = userRole === 'STUDENT' ? user.documentId : ctx.request.body.data.student || user.documentId;
    const existingResults = await strapi.documents('api::quiz-result.quiz-result').findMany({
      filters: {
        student: { documentId: studentId },
        quiz: { documentId: quizId },
      },
    });
    const attemptNo = existingResults.length + 1;

    const quizQuestions: any[] = await strapi.documents('api::question.question').findMany({
      filters: { quiz: { documentId: quizId } },
      populate: ['options'],
    });

    if (quizQuestions.length === 0) {
      return ctx.badRequest('This quiz has no questions.');
    }

    let score = 0;
    const answersToSave = [];

    for (const q of quizQuestions) {
      const userAns = answers.find((a: any) => a.question === q.documentId);
      const selectedOptionId = userAns ? userAns.selected_option : null;

      const optionsList = (q.options || []) as any[];
      const correctOption = optionsList.find((o: any) => o.is_correct);

      let isCorrect = false;
      if (selectedOptionId && correctOption) {
        isCorrect = selectedOptionId === correctOption.documentId;
      }

      if (isCorrect) {
        score++;
      }

      answersToSave.push({
        questionId: q.documentId,
        selectedOptionId,
        isCorrect,
      });
    }

    const totalQuestions = quizQuestions.length;
    const percentage = Number(((score / totalQuestions) * 100).toFixed(2));

    const quizResult = await strapi.documents('api::quiz-result.quiz-result').create({
      data: {
        student: studentId,
        quiz: quizId,
        attempt_no: attemptNo,
        score,
        total_questions: totalQuestions,
        percentage,
        submittedAt: new Date().toISOString(),
      },
    });

    const createdAnswers = [];
    for (const ans of answersToSave) {
      const createdAns = await strapi.documents('api::quiz-answer.quiz-answer').create({
        data: {
          quiz_result: quizResult.documentId,
          question: ans.questionId,
          selected_option: ans.selectedOptionId,
          is_correct: ans.isCorrect,
        },
      });
      createdAnswers.push(createdAns);
    }

    return {
      data: {
        ...quizResult,
        answers: createdAnswers,
      },
    };
  },

  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    if (user.user_role !== 'ADMIN') {
      return ctx.forbidden('Please submit your quiz via the /submit endpoint.');
    }

    return await super.create(ctx);
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    if (user.user_role !== 'ADMIN') {
      return ctx.forbidden('Quiz results cannot be modified.');
    }

    return await super.update(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    if (user.user_role !== 'ADMIN') {
      return ctx.forbidden('Quiz results cannot be deleted.');
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
        quiz: {
          course: {
            instructor: { documentId: user.documentId },
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
    const result: any = await strapi.documents('api::quiz-result.quiz-result').findOne({
      documentId: id,
      populate: ['student', 'quiz.course.instructor'],
    });

    if (!result) {
      return ctx.notFound('Quiz result not found.');
    }

    const userRole = user.user_role;

    if (userRole === 'STUDENT') {
      if (result.student?.documentId !== user.documentId) {
        return ctx.forbidden('You can only view your own quiz results.');
      }
    } else if (userRole === 'INSTRUCTOR') {
      if (result.quiz?.course?.instructor?.documentId !== user.documentId) {
        return ctx.forbidden('You can only view quiz results for your own courses.');
      }
    } else if (userRole !== 'ADMIN' && userRole !== 'CONTENT_MANAGER') {
      return ctx.forbidden();
    }

    return await super.findOne(ctx);
  },
}));
