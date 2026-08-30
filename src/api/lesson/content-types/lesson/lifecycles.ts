import { errors } from '@strapi/utils';

const { ValidationError } = errors;

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

export default {
  async beforeCreate(event: any) {
    const { data } = event.params;
    const courseId = getRelationId(data.course);
    const order = data.order;

    if (courseId && order !== undefined) {
      const existing = await strapi.documents('api::lesson.lesson').findFirst({
        filters: {
          course: { documentId: courseId },
          order: order,
        },
      });

      if (existing) {
        throw new ValidationError(`A lesson with order ${order} already exists in this course.`);
      }
    }
  },

  async beforeUpdate(event: any) {
    const { data, where } = event.params;
    const courseId = getRelationId(data.course);
    const order = data.order;
    const docId = where?.documentId;

    if (courseId && order !== undefined) {
      const existing = await strapi.documents('api::lesson.lesson').findFirst({
        filters: {
          course: { documentId: courseId },
          order: order,
        },
      });

      if (existing && existing.documentId !== docId) {
        throw new ValidationError(`A lesson with order ${order} already exists in this course.`);
      }
    }
  },
};
