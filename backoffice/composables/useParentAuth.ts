const SESS_MAX = 60 * 60 * 24 * 2;
const LONG_MAX = 60 * 60 * 24 * 30;

export function useParentAuth() {
  const config = useRuntimeConfig();

  const legacy = useCookie<string | null>('parent_jwt');
  const tokenSession = useCookie<string | null>('parent_sess', {
    maxAge: SESS_MAX,
    path: '/',
    sameSite: 'lax',
  });
  const tokenLong = useCookie<string | null>('parent_long', {
    maxAge: LONG_MAX,
    path: '/',
    sameSite: 'lax',
  });

  const activeToken = computed(
    () => tokenLong.value || tokenSession.value || legacy.value || null,
  );

  const isLoggedIn = computed(() => Boolean(activeToken.value?.length));

  async function login(email: string, password: string, rememberMe = false) {
    const res = await $fetch<{
      accessToken: string;
      mustChangePassword?: boolean;
      user: { id: string; email: string; fullName: string | null; phone: string | null };
    }>(`${config.public.apiBase}/auth/parent/login`, {
      method: 'POST',
      body: { email, password },
    });

    legacy.value = null;
    if (rememberMe) {
      tokenLong.value = res.accessToken;
      tokenSession.value = null;
    } else {
      tokenSession.value = res.accessToken;
      tokenLong.value = null;
    }
    return res;
  }

  async function requestPasswordReset(email: string) {
    return $fetch<{ ok: boolean; message: string }>(
      `${config.public.apiBase}/auth/parent/forgot-password`,
      {
        method: 'POST',
        body: { email },
      },
    );
  }

  function logout() {
    legacy.value = null;
    tokenSession.value = null;
    tokenLong.value = null;
  }

  function authHeaders(): HeadersInit {
    const t = activeToken.value;
    if (!t) return {};
    return { Authorization: `Bearer ${t}` };
  }

  function parseFilenameFromContentDisposition(cd: string | null): string | undefined {
    if (!cd) return undefined;
    const mStar = cd.match(/filename\*\s*=\s*UTF-8''([^;\s]+)/i);
    if (mStar?.[1]) {
      try {
        return decodeURIComponent(mStar[1].replace(/"/g, ''));
      } catch {
        return mStar[1];
      }
    }
    const m = cd.match(/filename\s*=\s*("?)([^";\r\n]+)\1/i);
    return m?.[2]?.trim();
  }

  async function authFetchBlob(path: string): Promise<{ blob: Blob; filename?: string }> {
    const t = activeToken.value;
    const res = await fetch(`${config.public.apiBase}${path}`, {
      method: 'GET',
      headers: {
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
        Accept: 'application/pdf',
      },
    });
    if (!res.ok) {
      let detail = res.statusText;
      try {
        const ct = res.headers.get('content-type') ?? '';
        if (ct.includes('application/json')) {
          const j = (await res.json()) as { message?: unknown };
          if (j?.message != null) {
            detail = Array.isArray(j.message) ? j.message.join(', ') : String(j.message);
          }
        } else {
          const text = await res.text();
          if (text) detail = text.slice(0, 200);
        }
      } catch {
        /* ignore */
      }
      throw new Error(detail || `HTTP ${res.status}`);
    }
    const filename = parseFilenameFromContentDisposition(res.headers.get('Content-Disposition'));
    return { blob: await res.blob(), filename };
  }

  function authFetch<T>(
    path: string,
    opts: { method?: 'GET' | 'POST' | 'PATCH'; body?: Record<string, unknown> } = {},
  ) {
    const t = activeToken.value;
    return $fetch<T>(`${config.public.apiBase}${path}`, {
      method: opts.method ?? 'GET',
      headers: t ? { Authorization: `Bearer ${t}` } : {},
      body: opts.body,
    });
  }

  return { token: activeToken, isLoggedIn, login, requestPasswordReset, logout, authHeaders, authFetch, authFetchBlob };
}
