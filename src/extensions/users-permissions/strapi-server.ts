export = (plugin: any) => {


  // check if factory
  const isFactory = typeof plugin.controllers.auth === 'function';
  const originalAuthController = isFactory ? plugin.controllers.auth : () => plugin.controllers.auth;

  plugin.controllers.auth = (args: any) => {
    const controller = isFactory ? originalAuthController(args) : originalAuthController();

    const originalCallback = controller.callback;
    const originalRegister = controller.register;

    controller.callback = async (ctx: any) => {

      if (ctx.request.body && ctx.request.body.email) {
        ctx.request.body.identifier = ctx.request.body.email;
        delete ctx.request.body.email;
      }

      await originalCallback(ctx);
      
      // add success message
      if (ctx.body && ctx.body.user) {
        ctx.body.message = "Login successfully";
      }
    };

    controller.register = async (ctx: any) => {

      
      const originalUsername = ctx.request.body.username;
      
      // bypass username uniqueness
      if (originalUsername) {
        ctx.request.body.username = `${originalUsername}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      }

      await originalRegister(ctx);

      // restore username
      if (ctx.body && ctx.body.user && ctx.body.user.id && originalUsername) {
        // @ts-ignore
        await strapi.db.query('plugin::users-permissions.user').update({
          where: { id: ctx.body.user.id },
          data: { username: originalUsername }
        });
        
        ctx.body.user.username = originalUsername;
      }
      
      // add success message
      if (ctx.body && ctx.body.user) {
        ctx.body.message = "Registration successful";
      }
    };

    return controller;
  };

  return plugin;
};
