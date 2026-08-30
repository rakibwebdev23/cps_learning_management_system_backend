import type { Core } from '@strapi/strapi';

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    if (strapi.plugin('documentation')) {
      strapi.plugin('documentation').service('override').registerOverride({
        paths: {
          "/auth/local": {
            post: {
              tags: ["Users-Permissions - Auth"],
              summary: "Local login",
              description: "Returns a jwt and user info",
              requestBody: {
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        email: { type: "string" },
                        password: { type: "string" }
                      },
                      required: ["email", "password"]
                    },
                  }
                },
                required: true
              },
              responses: {
                "200": {
                  description: "Connection",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          jwt: { type: "string" },
                          message: { type: "string" },
                          user: { $ref: "#/components/schemas/Users-Permissions-User" }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
        }
      }, {
        pluginOrigin: "users-permissions"
      });
    }
  },

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    strapi.db.lifecycles.subscribe({
      models: ['plugin::users-permissions.user'],
      async beforeCreate(event: any) {
        try {
          const { data } = event.params;
          if (data.user_role) {
            const roleType = data.user_role.toLowerCase();
            const role = await strapi.documents('plugin::users-permissions.role').findFirst({
              filters: { type: roleType },
            });
            if (role) {
              data.role = role.id;
            }
          }
        } catch (err) {
          console.error("ERROR IN beforeCreate HOOK:", err);
        }
      },
      async beforeUpdate(event: any) {
        try {
          const { data } = event.params;
          if (data && data.user_role) {
            const roleType = data.user_role.toLowerCase();
            const role = await strapi.documents('plugin::users-permissions.role').findFirst({
              filters: { type: roleType },
            });
            if (role) {
              data.role = role.id;
            }
          }
        } catch (err) {
          console.error("ERROR IN beforeUpdate HOOK:", err);
        }
      },
    });

    try {
      const roles = await strapi.db.query('plugin::users-permissions.role').findMany();
      for (const role of roles) {
        const actionPrefixes = [
          'api::course.course.find',
          'api::course.course.findOne',
          'api::course.course.create',
          'api::course.course.update',
          'api::course.course.delete',
          'api::lesson.lesson.find',
          'api::lesson.lesson.findOne',
          'api::lesson.lesson.create',
          'api::lesson.lesson.update',
          'api::lesson.lesson.delete',
          'api::quiz.quiz.find',
          'api::quiz.quiz.findOne',
          'api::quiz.quiz.create',
          'api::quiz.quiz.update',
          'api::quiz.quiz.delete',
          'api::quiz.quiz.submit',
          'api::question.question.find',
          'api::question.question.findOne',
          'api::question.question.create',
          'api::question.question.update',
          'api::question.question.delete',
          'api::option.option.find',
          'api::option.option.findOne',
          'api::option.option.create',
          'api::blog-post.blog-post.find',
          'api::blog-post.blog-post.findOne',
          'api::blog-post.blog-post.create',
          'api::blog-post.blog-post.update',
          'api::blog-post.blog-post.delete',
          'api::enrollment.enrollment.find',
          'api::enrollment.enrollment.findOne',
          'api::enrollment.enrollment.create',
          'api::enrollment.enrollment.update',
          'api::quiz-result.quiz-result.find',
          'api::quiz-result.quiz-result.findOne',
          'api::quiz-result.quiz-result.create',
          'api::lesson-progress.lesson-progress.find',
          'api::lesson-progress.lesson-progress.findOne',
          'api::lesson-progress.lesson-progress.create',
          'api::dashboard.dashboard.getStats',
          'api::contact.contact.create',
          'plugin::users-permissions.user.find',
          'plugin::users-permissions.user.findOne',
          'plugin::users-permissions.user.me',
        ];

        for (const action of actionPrefixes) {
          const existing = await strapi.db.query('plugin::users-permissions.permission').findOne({
            where: { action, role: role.id },
          });

          if (!existing) {
            await strapi.db.query('plugin::users-permissions.permission').create({
              data: {
                action,
                role: role.id,
              },
            });
          }
        }
      }
    } catch (err) {
      console.error("Error setting permissions in bootstrap:", err);
    }
  },
};
