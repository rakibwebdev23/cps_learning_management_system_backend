const strapi = require('@strapi/strapi');

async function fix() {
  const app = await strapi.createStrapi().load();
  try {
    const roleService = app.plugin('users-permissions').service('role');
    const roles = await roleService.find();
    
    // We need to fetch full roles with permissions
    const getRole = async (id) => {
        return await roleService.findOne(id);
    };

    const adminRole = roles.find(r => r.name.toLowerCase() === 'admin'); // Not users-permissions admin, but if exists
    const contentManager = roles.find(r => r.name.toLowerCase() === 'content_manager' || r.name.toLowerCase() === 'content manager');
    const instructor = roles.find(r => r.type === 'instructor' || r.name.toLowerCase() === 'instructor');
    const student = roles.find(r => r.type === 'student' || r.name.toLowerCase() === 'student');

    console.log("Found roles:", { 
      contentManager: contentManager?.name, 
      instructor: instructor?.name, 
      student: student?.name 
    });

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
fix();
