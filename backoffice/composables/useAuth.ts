import { checkAdminAccessToken } from '~/utils/admin-token'

export type AdminLoginResult =
  | { ok: true; mustChangePassword: boolean }
  | { ok: false; message: string }

/**
 * Auth réservée à l’espace admin : cookies `admin_long` / `admin_sess`.
 */
export function useAuth() {
  const long = useCookie<string | null>('admin_long', {
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
    path: '/',
    default: () => null,
  })
  const sess = useCookie<string | null>('admin_sess', {
    sameSite: 'lax',
    path: '/',
    default: () => null,
  })
  const rememberPref = useCookie<boolean>('admin_remember', {
    sameSite: 'lax',
    path: '/',
    default: () => true,
  })

  const token = computed(() => long.value ?? sess.value)
  const isAuthenticated = computed(() => checkAdminAccessToken(token.value).ok)

  const mustChangePassword = computed(() => {
    const check = checkAdminAccessToken(token.value)
    return check.ok && check.mustChangePassword
  })

  function setAccessToken(accessToken: string, remember?: boolean) {
    const useRemember = remember ?? rememberPref.value
    long.value = null
    sess.value = null
    rememberPref.value = useRemember
    if (useRemember) {
      long.value = accessToken
    } else {
      sess.value = accessToken
    }
  }

  async function login(email: string, password: string, remember: boolean): Promise<AdminLoginResult> {
    const trimmed = email.trim().toLowerCase()
    if (!trimmed || !password) {
      return { ok: false, message: 'Email et mot de passe requis.' }
    }

    const config = useRuntimeConfig()
    try {
      const res = await $fetch<{
        accessToken: string
        mustChangePassword?: boolean
      }>(`${config.public.apiBase}/auth/admin/login`, {
        method: 'POST',
        body: { email: trimmed, password },
      })
      setAccessToken(res.accessToken, remember)
      return { ok: true, mustChangePassword: Boolean(res.mustChangePassword) }
    } catch (e: unknown) {
      const err = e as { data?: { message?: string | string[] }; statusMessage?: string }
      const raw = err?.data?.message
      const msg =
        typeof raw === 'string'
          ? raw
          : Array.isArray(raw)
            ? raw[0]
            : err?.statusMessage ?? 'Identifiants incorrects.'
      return { ok: false, message: msg }
    }
  }

  function logout() {
    long.value = null
    sess.value = null
  }

  return {
    token,
    isAuthenticated,
    mustChangePassword,
    setAccessToken,
    login,
    logout,
  }
}
