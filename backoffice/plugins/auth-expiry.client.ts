export default defineNuxtPlugin(() => {
  const apiBase = useRuntimeConfig().public.apiBase;
  const adminLong = useCookie<string | null>('admin_long');
  const adminSess = useCookie<string | null>('admin_sess');
  const parentLegacy = useCookie<string | null>('parent_jwt');
  const parentSess = useCookie<string | null>('parent_sess');
  const parentLong = useCookie<string | null>('parent_long');

  const wrapped = $fetch.create({
    onResponseError({ request, response }) {
      const status = response?.status;
      if (status !== 401 && status !== 403) return;

      const reqUrl = String(request ?? '');
      const isApiCall = reqUrl.startsWith(apiBase);
      if (!isApiCall) return;

      const path = useRoute().path;
      if (path.startsWith('/admin')) {
        adminLong.value = null;
        adminSess.value = null;
        if (path !== '/admin/login') {
          void navigateTo('/admin/login');
        }
        return;
      }

      if (path.startsWith('/parent')) {
        parentLegacy.value = null;
        parentSess.value = null;
        parentLong.value = null;
        if (path !== '/parent/login' && path !== '/parent/onboarding') {
          void navigateTo('/parent/login');
        }
      }
    },
  });

  globalThis.$fetch = wrapped;
});
