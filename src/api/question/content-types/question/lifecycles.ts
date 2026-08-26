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
    const quizId = getRelationId(data.quiz);
    const order = data.order;

    if (quizId && order !== undefined) {
      const existing = await strapi.documents('api::question.question').findFirst({
        filters: {
          quiz: { documentId: quizId },
          order: order,
        },
      });

      if (existing) {
        throw new ValidationError(`A question with order ${order} already exists in this quiz.`);
      }
    }
  },

  async beforeUpdate(event: any) {
    const { data, where } = event.params;
    const quizId = getRelationId(data.quiz);
    const order = data.order;
    const docId = where?.documentId;

    if (quizId && order !== undefined) {
      const existing = await strapi.documents('api::question.question').findFirst({
        filters: {
          quiz: { documentId: quizId },
          order: order,
        },
      });

      if (existing && existing.documentId !== docId) {
        throw new ValidationError(`A question with order ${order} already exists in this quiz.`);
      }
    }
  },
};
