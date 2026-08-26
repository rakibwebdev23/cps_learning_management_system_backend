export default {
  async enrollStudent(studentId: string, courseId: string, strapi: any) {
    const existing = await strapi.documents('api::enrollment.enrollment').findFirst({
      filters: {
        student: { documentId: studentId },
        course: { documentId: courseId },
      },
    });

    if (existing) {
      throw new Error('Student is already enrolled in this course.');
    }

    return await strapi.documents('api::enrollment.enrollment').create({
      data: {
        student: studentId,
        course: courseId,
        enrolledAt: new Date().toISOString(),
        status: 'ACTIVE',
      },
    });
  },
};
