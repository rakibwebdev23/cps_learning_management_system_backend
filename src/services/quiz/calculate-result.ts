export default {
  async gradeQuiz(quizId: string, answers: any[], studentId: string, userRole: string, strapi: any) {
    // fetch quiz and course
    const quiz: any = await strapi.documents('api::quiz.quiz').findOne({
      documentId: quizId,
      populate: ['course'],
    });

    if (!quiz) {
      throw new Error('Quiz not found.');
    }

    // verify student enrollment
    if (userRole === 'student') {
      const enrollment = await strapi.documents('api::enrollment.enrollment').findFirst({
        filters: {
          student: { documentId: studentId },
          course: { documentId: quiz.course?.documentId },
          status: 'active',
        },
      });

      if (!enrollment) {
        throw new Error('You must be actively enrolled in this course to take this quiz.');
      }
    }

    // determine attempt
    const existingResults = await strapi.documents('api::quiz-result.quiz-result').findMany({
      filters: {
        student: { documentId: studentId },
        quiz: { documentId: quizId },
      },
    });
    const attemptNo = existingResults.length + 1;

    // fetch questions
    const quizQuestions: any[] = await strapi.documents('api::question.question').findMany({
      filters: { quiz: { documentId: quizId } },
      populate: ['options'],
    });

    if (quizQuestions.length === 0) {
      throw new Error('This quiz has no questions.');
    }

    // grade quiz
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

    return {
      studentId,
      quizId,
      attemptNo,
      score,
      totalQuestions,
      percentage,
      answersToSave,
    };
  },
};
