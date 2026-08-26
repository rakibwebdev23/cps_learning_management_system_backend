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
                        email: {
                          type: "string"
                        },
                        password: {
                          type: "string"
                        }
                      },
                      required: ["email", "password"]
                    },
                    example: {
                      email: "student@example.com",
                      password: "student123"
                    }
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
                          jwt: {
                            type: "string"
                          },
                          message: {
                            type: "string",
                            example: "Login successfully"
                          },
                          user: {
                            $ref: "#/components/schemas/Users-Permissions-User"
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "/auth/local/register": {
            post: {
              tags: ["Users-Permissions - Auth"],
              summary: "Register a user",
              description: "Returns a jwt and user info",
              requestBody: {
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        username: {
                          type: "string"
                        },
                        email: {
                          type: "string"
                        },
                        password: {
                          type: "string"
                        },
                        user_role: {
                          type: "string"
                        }
                      },
                      required: ["username", "email", "password", "user_role"]
                    },
                    example: {
                      username: "Student",
                      email: "student@example.com",
                      password: "student123",
                      user_role: "student"
                    }
                  }
                },
                required: true
              },
              responses: {
                "200": {
                  description: "Successful registration",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          jwt: {
                            type: "string"
                          },
                          message: {
                            type: "string",
                            example: "Registration successful"
                          },
                          user: {
                            $ref: "#/components/schemas/Users-Permissions-User"
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }, {
        pluginOrigin: "users-permissions"
      });
    }
  },

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Role creation has been moved to manual setup via Admin Panel

    // 2. register user lifecycle hook
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
              // In database lifecycle, try assigning the role ID (integer) or documentId
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
  },
};
