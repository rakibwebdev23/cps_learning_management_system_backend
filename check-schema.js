const strapi = require('@strapi/strapi');
const app = strapi();
app.load().then(() => {
  const userSchema = app.getModel('plugin::users-permissions.role');
  console.log("ROLE SCHEMA:", Object.keys(userSchema.attributes));
  const userModel = app.getModel('plugin::users-permissions.user');
  console.log("USER SCHEMA:", Object.keys(userModel.attributes));
  process.exit(0);
});
