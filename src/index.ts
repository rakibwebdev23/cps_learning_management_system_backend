import type { Core } from '@strapi/strapi';

export default {
  register() { },

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Role creation has been moved to manual setup via Admin Panel

    // 2. register user lifecycle hook
    strapi.db.lifecycles.subscribe({
      models: ['plugin::users-permissions.user'],

      async beforeCreate(event: any) {
        const { data } = event.params;
        if (data.user_role) {
          const roleType = data.user_role.toLowerCase();
          const role = await strapi.documents('plugin::users-permissions.role').findFirst({
            filters: { type: roleType },
          });
          if (role) {
            data.role = role.documentId;
          }
        }
      },

      async beforeUpdate(event: any) {
        const { data } = event.params;
        if (data && data.user_role) {
          const roleType = data.user_role.toLowerCase();
          const role = await strapi.documents('plugin::users-permissions.role').findFirst({
            filters: { type: roleType },
          });
          if (role) {
            data.role = role.documentId;
          }
        }
      },
    });
  },
};
