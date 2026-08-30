const strapi = require('@strapi/strapi');

async function test() {
  const app = await strapi.createStrapi().load();
  try {
    const roles = await app.db.query('plugin::users-permissions.role').findMany({
      populate: ['permissions']
    });

    for (const role of roles) {
      if (['instructor', 'student', 'content_manager'].includes(role.type.toLowerCase()) || ['instructor', 'student', 'content manager'].includes(role.name.toLowerCase())) {
        console.log(`\n=== ROLE: ${role.name} (${role.type}) ===`);
        const apiPerms = role.permissions.filter(p => p.action.startsWith('api::'));
        
        // Group by controller
        const grouped = {};
        for (const p of apiPerms) {
          const parts = p.action.split('.');
          const model = parts[1];
          const action = parts[2];
          if (!grouped[model]) grouped[model] = [];
          grouped[model].push(action);
        }

        for (const [model, actions] of Object.entries(grouped)) {
          console.log(`- ${model}: ${actions.join(', ')}`);
        }
      }
    }
  } catch (err) {
    console.error("ERROR:", err);
  } finally {
    process.exit(0);
  }
}
test();
