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
    const studentId = getRelationId(data.student);
    const lessonId = getRelationId(data.lesson);

    if (studentId && lessonId) {
      const existing = await strapi.documents('api::lesson-progress.lesson-progress').findFirst({
        filters: {
          student: { documentId: studentId },
          lesson: { documentId: lessonId },
        },
      });

      if (existing) {
        throw new ValidationError('Progress for this lesson has already been recorded for this student.');
      }
    }
  },

  async beforeUpdate(event: any) {
    const { data, where } = event.params;
    const studentId = getRelationId(data.student);
    const lessonId = getRelationId(data.lesson);
    const docId = where?.documentId;

    if (studentId && lessonId) {
      const existing = await strapi.documents('api::lesson-progress.lesson-progress').findFirst({
        filters: {
          student: { documentId: studentId },
          lesson: { documentId: lessonId },
        },
      });

      if (existing && existing.documentId !== docId) {
        throw new ValidationError('Progress for this lesson has already been recorded for this student.');
      }
    }
  },
};
