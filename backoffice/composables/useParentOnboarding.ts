const ONBOARDING_COOKIE = 'parent_onboarding_done';

export function useParentOnboarding() {
  const done = useCookie<string | null>(ONBOARDING_COOKIE, {
    maxAge: 60 * 60 * 24 * 365 * 10,
    sameSite: 'lax',
    path: '/',
  });

  function hasCompletedOnboarding(): boolean {
    return done.value === '1';
  }

  function markOnboardingCompleted() {
    done.value = '1';
  }

  async function finishOnboarding() {
    markOnboardingCompleted();
    const { isLoggedIn } = useParentAuth();
    if (isLoggedIn.value) {
      return navigateTo('/parent');
    }
    return navigateTo('/parent/login');
  }

  return {
    hasCompletedOnboarding,
    markOnboardingCompleted,
    finishOnboarding,
  };
}
