export default (policyContext: any, config: any, { strapi }: any) => {
  const user = policyContext.state.user;
  if (user && user.user_role === 'admin') {
    return true;
  }
  return false;
};
