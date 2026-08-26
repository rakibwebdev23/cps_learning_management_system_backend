import { factories } from '@strapi/strapi';
import calculateResultService from '../../../services/quiz/calculate-result';

export default factories.createCoreController('api::quiz-result.quiz-result', ({ strapi }) => ({
  async submit(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const userRole = user.user_role;
    if (userRole !== 'student' && userRole !== 'admin') {
      return ctx.forbidden('Only students or admins can submit quiz results.');
    }

    const { quiz: quizId, answers } = ctx.request.body.data || {};
    if (!quizId || !Array.isArray(answers)) {
      return ctx.badRequest('Quiz and answers are required.');
    }

    try {
      const studentId = userRole === 'student' ? user.documentId : ctx.request.body.data.student || user.documentId;
      const graded = await calculateResultService.gradeQuiz(
        quizId,
        answers,
        studentId,
        userRole,
        strapi
      );

      const quizResult = await strapi.documents('api::quiz-result.quiz-result').create({
        data: {
          student: graded.studentId,
          quiz: graded.quizId,
          attempt_no: graded.attemptNo,
          score: graded.score,
          total_questions: graded.totalQuestions,
          percentage: graded.percentage,
          submittedAt: new Date().toISOString(),
        },
      });

      const createdAnswers = [];
      for (const ans of graded.answersToSave) {
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
    } catch (err: any) {
      return ctx.badRequest(err.message || 'An error occurred while grading the quiz.');
    }
  },

  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    if (user.user_role !== 'admin') {
      return ctx.forbidden('Please submit your quiz via the /submit endpoint.');
    }

    return await super.create(ctx);
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    if (user.user_role !== 'admin') {
      return ctx.forbidden('Quiz results cannot be modified.');
    }

    return await super.update(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    if (user.user_role !== 'admin') {
      return ctx.forbidden('Quiz results cannot be deleted.');
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
        student: { documentId: user.documentId },
      };
    } else if (userRole === 'instructor') {
      ctx.query.filters = {
        ...queryFilters,
        quiz: {
          course: {
            instructor: { documentId: user.documentId },
          },
        },
      };
    } else if (userRole !== 'admin' && userRole !== 'content_manager') {
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

    if (userRole === 'student') {
      if (result.student?.documentId !== user.documentId) {
        return ctx.forbidden('You can only view your own quiz results.');
      }
    } else if (userRole === 'instructor') {
      if (result.quiz?.course?.instructor?.documentId !== user.documentId) {
        return ctx.forbidden('You can only view quiz results for your own courses.');
      }
    } else if (userRole !== 'admin' && userRole !== 'content_manager') {
      return ctx.forbidden();
    }

    return await super.findOne(ctx);
  },
}));
