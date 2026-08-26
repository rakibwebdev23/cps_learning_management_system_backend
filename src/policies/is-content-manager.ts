export default (policyContext: any, config: any, { strapi }: any) => {
  const user = policyContext.state.user;
  if (user && (user.user_role === 'CONTENT_MANAGER' || user.user_role === 'ADMIN')) {
    return true;
  }
  return false;
};
