const strapi = require('@strapi/strapi');
async function test() {
  const app = await strapi.createStrapi().load();
  try {
    const admins = await app.db.query('admin::user').findMany();
    console.log("ADMINS:", admins.map(a => ({ email: a.email, id: a.id })));
  } catch (err) {
    console.error("ERROR:", err);
  } finally {
    process.exit(0);
  }
}
test();
