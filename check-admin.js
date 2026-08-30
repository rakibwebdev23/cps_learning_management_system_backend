const { createStrapi } = require('@strapi/strapi');

async function main() {
  const strapi = await createStrapi().load();
  
  // Check admin panel users
  const adminUsers = await strapi.db.query('admin::user').findMany();
  console.log('--- ADMIN PANEL USERS ---');
  console.log(adminUsers.map(u => ({ id: u.id, email: u.email, username: u.username, isActive: u.isActive })));

  // Check Users-Permissions roles
  const roles = await strapi.db.query('plugin::users-permissions.role').findMany({
    populate: ['permissions']
  });
  console.log('--- USERS-PERMISSIONS ROLES ---');
  for (const r of roles) {
    console.log(`Role: ${r.name} (${r.type}) -> Permissions Count: ${r.permissions ? r.permissions.length : 0}`);
  }

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
