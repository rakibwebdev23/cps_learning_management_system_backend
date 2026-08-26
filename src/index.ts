import type { Core } from '@strapi/strapi';

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // 1. Auto-initialize required Roles if they do not exist
    const rolesToCheck = [
      { name: 'ADMIN', type: 'admin', description: 'Administrator with full access' },
      { name: 'CONTENT_MANAGER', type: 'content_manager', description: 'Content Manager role' },
      { name: 'INSTRUCTOR', type: 'instructor', description: 'Instructor role' },
      { name: 'STUDENT', type: 'student', description: 'Student role' },
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

    // 2. Register User Lifecycle Hook to sync user_role enum to users-permissions role relation
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
