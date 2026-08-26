import type { Core } from '@strapi/strapi';

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // 1. auto-initialize required roles if they do not exist
    const rolesToCheck = [
      { name: 'admin', type: 'admin', description: 'Administrator with full access' },
      { name: 'content_manager', type: 'content_manager', description: 'Content Manager role' },
      { name: 'instructor', type: 'instructor', description: 'Instructor role' },
      { name: 'student', type: 'student', description: 'Student role' },
    ];

    for (const r of rolesToCheck) {
      try {
        const existing = await strapi.documents('plugin::users-permissions.role').findFirst({
          filters: { type: r.type },
        });

        if (!existing) {
          await strapi.documents('plugin::users-permissions.role').create({
            data: r,
          });
          console.log(`[Bootstrap] Created role: ${r.name}`);
        }
      } catch (err) {
        console.error(`[Bootstrap] Error initializing role ${r.name}:`, err);
      }
    }

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
