import {
  decodeAdminTokenPayload,
  type AppModuleRoleCode,
} from '~/utils/admin-permissions'

export type AdminTokenCheck =
  | { ok: true; role: string; permissions: AppModuleRoleCode[]; isSuperAdmin: boolean; sub: string; mustChangePassword: boolean }
  | { ok: false; reason: 'missing' | 'malformed' | 'wrong_role' | 'expired' }

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3 || !parts[1]) return null
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const json = JSON.parse(atob(padded)) as unknown
    return json && typeof json === 'object' && !Array.isArray(json) ? (json as Record<string, unknown>) : null
  } catch {
    return null
  }
}

/**
 * Vérifie qu’un JWT stocké pour l’admin correspond bien à un compte ADMIN ou STAFF
 * (évite qu’un jeton « parent » ou falsifié donne accès à /admin).
 * La signature n’est pas vérifiée ici ; l’API la valide à chaque appel.
 */
export function checkAdminAccessToken(token: string | null | undefined): AdminTokenCheck {
  if (!token || !token.trim()) {
    return { ok: false, reason: 'missing' }
  }
  const payload = decodeJwtPayload(token.trim())
  if (!payload) {
    return { ok: false, reason: 'malformed' }
  }
  const exp = payload.exp
  if (typeof exp === 'number' && exp * 1000 < Date.now()) {
    return { ok: false, reason: 'expired' }
  }
  const role = payload.role
  if (role !== 'ADMIN' && role !== 'STAFF') {
    return { ok: false, reason: 'wrong_role' }
  }
  const decoded = decodeAdminTokenPayload(token.trim())
  if (!decoded) {
    return { ok: false, reason: 'malformed' }
  }
  return {
    ok: true,
    role: String(role),
    permissions: decoded.permissions,
    isSuperAdmin: decoded.isSuperAdmin,
    sub: decoded.sub,
    mustChangePassword: decoded.mustChangePassword,
  }
}
