export default defineNuxtRouteMiddleware((to) => {
  if (!to.path.startsWith('/parent')) return;

  const legacy = useCookie<string | null>('parent_jwt');
  const sess = useCookie<string | null>('parent_sess');
  const long = useCookie<string | null>('parent_long');
  const isLoggedIn = Boolean(legacy.value || sess.value || long.value);

  const { hasCompletedOnboarding } = useParentOnboarding();

  if (to.path === '/parent/onboarding') {
    if (isLoggedIn || hasCompletedOnboarding()) {
      return navigateTo(isLoggedIn ? '/parent' : '/parent/login');
    }
    return;
  }

  if (to.path === '/parent/login') return;

  if (!isLoggedIn) {
    if (to.path === '/parent' && !hasCompletedOnboarding()) {
      return navigateTo('/parent/onboarding');
    }
    return navigateTo('/parent/login');
  }
});
