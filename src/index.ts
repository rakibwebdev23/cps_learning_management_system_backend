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
        },
        components: {
          schemas: {
            CourseRequest: {
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    thumbnail_url: { type: "string" },
                    price: { type: "number", format: "float" }
                  }
                }
              }
            },
            LessonRequest: {
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    content: { type: "string" },
                    video_url: { type: "string" },
                    order: { type: "integer" },
                    course_id: { type: "string", description: "Course documentId" }
                  }
                }
              }
            },
            QuizRequest: {
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    course_id: { type: "string", description: "Course documentId" }
                  }
                }
              }
            },
            QuestionRequest: {
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    question: { type: "string" },
                    order: { type: "integer" },
                    quiz_id: { type: "string", description: "Quiz documentId" }
                  }
                }
              }
            },
            OptionRequest: {
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    option_text: { type: "string" },
                    is_correct: { type: "boolean" },
                    question_id: { type: "string", description: "Question documentId" }
                  }
                }
              }
            },
            EnrollmentRequest: {
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    course_id: { type: "string", description: "Course documentId" }
                  }
                }
              }
            },
            LessonProgressRequest: {
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    completed: { type: "boolean" },
                    course_id: { type: "string", description: "Course documentId" },
                    lesson_id: { type: "string", description: "Lesson documentId" }
                  }
                }
              }
            },
            QuizResultRequest: {
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    attempt_no: { type: "integer" },
                    score: { type: "integer" },
                    total_questions: { type: "integer" },
                    percentage: { type: "number", format: "float" },
                    quiz_id: { type: "string", description: "Quiz documentId" }
                  }
                }
              }
            },
            QuizAnswerRequest: {
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    is_correct: { type: "boolean" },
                    quiz_result_id: { type: "string", description: "Quiz Result documentId" },
                    question_id: { type: "string", description: "Question documentId" },
                    selected_option_id: { type: "string", description: "Option documentId" }
                  }
                }
              }
            },
            BlogPostRequest: {
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    body: { type: "string" },
                    cover_image_url: { type: "string" },
                    blog_status: { type: "string", enum: ["draft", "published"] }
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
    // register user hook
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
              // assign role id
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
