export default {
  async calculateCourseProgress(studentId: string, courseId: string, strapi: any) {
    const totalLessons = await strapi.documents('api::lesson.lesson').findMany({
      filters: { course: { documentId: courseId } },
    });

    if (totalLessons.length === 0) {
      return 0;
    }

    const completedProgresses = await strapi.documents('api::lesson-progress.lesson-progress').findMany({
      filters: {
        student: { documentId: studentId },
        course: { documentId: courseId },
        completed: true,
      },
    });

    const percentage = (completedProgresses.length / totalLessons.length) * 100;
    return Number(percentage.toFixed(2));
  },
};
