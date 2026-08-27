const strapi = require('@strapi/strapi');

async function test() {
  const app = await strapi.createStrapi().load();
  try {
    const roles = await app.db.query('plugin::users-permissions.role').findMany({
      populate: ['permissions']
    });
    console.log("Roles found:", roles.map(r => r.name));
    for (const role of roles) {
      if (role.name.toLowerCase() === 'student') {
        const perms = role.permissions.filter(p => p.action.startsWith('api::'));
        console.log("Student API perms:", perms.map(p => p.action));
      }
    }
  } catch (err) {
    console.error("ERROR:", err);
  } finally {
    process.exit(0);
  }
}
test();
