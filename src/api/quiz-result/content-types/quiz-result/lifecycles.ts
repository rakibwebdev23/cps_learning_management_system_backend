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
    const quizId = getRelationId(data.quiz);
    const attemptNo = data.attempt_no;

    if (studentId && quizId && attemptNo !== undefined) {
      const existing = await strapi.documents('api::quiz-result.quiz-result').findFirst({
        filters: {
          student: { documentId: studentId },
          quiz: { documentId: quizId },
          attempt_no: attemptNo,
        },
      });

      if (existing) {
        throw new ValidationError(`Attempt number ${attemptNo} for this quiz has already been recorded for this student.`);
      }
    }
  },

  async beforeUpdate(event: any) {
    const { data, where } = event.params;
    const studentId = getRelationId(data.student);
    const quizId = getRelationId(data.quiz);
    const attemptNo = data.attempt_no;
    const docId = where?.documentId;

    if (studentId && quizId && attemptNo !== undefined) {
      const existing = await strapi.documents('api::quiz-result.quiz-result').findFirst({
        filters: {
          student: { documentId: studentId },
          quiz: { documentId: quizId },
          attempt_no: attemptNo,
        },
      });

      if (existing && existing.documentId !== docId) {
        throw new ValidationError(`Attempt number ${attemptNo} for this quiz has already been recorded for this student.`);
      }
    }
  },
};
