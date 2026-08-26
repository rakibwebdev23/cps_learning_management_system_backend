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

export default factories.createCoreController('api::lesson.lesson', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const userRole = user.user_role;
    if (userRole === 'STUDENT') {
      return ctx.forbidden('Students cannot create lessons.');
    }

    if (userRole === 'INSTRUCTOR') {
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
        return ctx.forbidden('You can only add lessons to your own courses.');
      }
    }

    return await super.create(ctx);
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const userRole = user.user_role;
    if (userRole === 'STUDENT') {
      return ctx.forbidden('Students cannot update lessons.');
    }

    if (userRole === 'INSTRUCTOR') {
      const { id } = ctx.params;
      const lesson: any = await strapi.documents('api::lesson.lesson').findOne({
        documentId: id,
        populate: {
          course: {
            populate: ['instructor'],
          },
        },
      });

      if (!lesson) {
        return ctx.notFound('Lesson not found.');
      }

      if (lesson.course?.instructor?.documentId !== user.documentId) {
        return ctx.forbidden('You can only update lessons of your own courses.');
      }

      // If trying to change course, check permission on the new course
      const newCourseId = getRelationId(ctx.request.body.data?.course);
      if (newCourseId && newCourseId !== lesson.course?.documentId) {
        const newCourse: any = await strapi.documents('api::course.course').findOne({
          documentId: newCourseId,
          populate: ['instructor'],
        });
        if (!newCourse || newCourse.instructor?.documentId !== user.documentId) {
          return ctx.forbidden('You can only move lessons to your own courses.');
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
      return ctx.forbidden('Students cannot delete lessons.');
    }

    if (userRole === 'INSTRUCTOR') {
      const { id } = ctx.params;
      const lesson: any = await strapi.documents('api::lesson.lesson').findOne({
        documentId: id,
        populate: {
          course: {
            populate: ['instructor'],
          },
        },
      });

      if (!lesson) {
        return ctx.notFound('Lesson not found.');
      }

      if (lesson.course?.instructor?.documentId !== user.documentId) {
        return ctx.forbidden('You can only delete lessons of your own courses.');
      }
    }

    return await super.delete(ctx);
  },

  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const queryFilters = (ctx.query.filters || {}) as Record<string, any>;

    // Students can only see lessons in courses they are enrolled in
    if (user.user_role === 'STUDENT') {
      ctx.query.filters = {
        ...queryFilters,
        course: {
          enrollments: {
            student: { documentId: user.documentId },
          },
        },
      };
    }

    // Instructors can only see lessons of their own courses
    if (user.user_role === 'INSTRUCTOR') {
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
    const lesson: any = await strapi.documents('api::lesson.lesson').findOne({
      documentId: id,
      populate: ['course'],
    });

    if (!lesson) {
      return ctx.notFound('Lesson not found.');
    }

    if (user.user_role === 'STUDENT') {
      const courseId = lesson.course?.documentId;
      if (!courseId) {
        return ctx.forbidden('This lesson is not associated with any course.');
      }

      // Check if student has enrollment in course
      const enrollment = await strapi.documents('api::enrollment.enrollment').findFirst({
        filters: {
          student: { documentId: user.documentId },
          course: { documentId: courseId },
        },
      });
      if (!enrollment) {
        return ctx.forbidden('You must be enrolled in this course to view this lesson.');
      }
    }

    if (user.user_role === 'INSTRUCTOR') {
      const courseId = lesson.course?.documentId;
      if (!courseId) {
        return ctx.forbidden('This lesson is not associated with any course.');
      }

      const course: any = await strapi.documents('api::course.course').findOne({
        documentId: courseId,
        populate: ['instructor'],
      });
      if (course?.instructor?.documentId !== user.documentId) {
        return ctx.forbidden('You can only view lessons of your own courses.');
      }
    }

    return await super.findOne(ctx);
  },
}));
