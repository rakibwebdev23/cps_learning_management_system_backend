const strapi = require('@strapi/strapi');
async function test() {
  const app = await strapi.createStrapi().load();
  try {
    const role = await app.documents('plugin::users-permissions.role').findFirst({
      filters: { type: 'student' }
    });
    console.log("FOUND STUDENT ROLE:", role);
    
    // Attempt to create a user using db query
    const newUser = await app.db.query('plugin::users-permissions.user').create({
      data: {
        username: 'test_student_' + Date.now(),
        email: `test_student_${Date.now()}@example.com`,
        password: 'password123',
        user_role: 'student',
        // role: role.documentId // or role.id?
      }
    });
    console.log("CREATED USER:", newUser);
  } catch (err) {
    console.error("ERROR CREATING USER:", err);
  } finally {
    process.exit(0);
  }
}
test();
