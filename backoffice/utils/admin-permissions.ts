/** Codes des rôles d'accès aux modules (alignés sur le backend AppModuleRole). */
export type AppModuleRoleCode =
  | 'INSCRIPTIONS'
  | 'ELEVES'
  | 'PARENTS'
  | 'PROGRAMME'
  | 'ATELIERS'
  | 'LANDING'
  | 'UTILISATEURS'
  | 'FINANCE'
  | 'DOCUMENTS'
  | 'PARAMETRAGE'

export const APP_MODULE_ROLE_LABELS: Record<AppModuleRoleCode, string> = {
  INSCRIPTIONS: 'Inscriptions',
  ELEVES: 'Élèves',
  PARENTS: 'Parents',
  PROGRAMME: 'Programme',
  ATELIERS: 'Gestion des ateliers',
  LANDING: 'Landing page',
  UTILISATEURS: 'Utilisateurs',
  FINANCE: 'Paiements & Comptabilité',
  DOCUMENTS: 'Documents',
  PARAMETRAGE: 'Paramétrage',
}

export const ALL_APP_MODULE_ROLE_CODES: AppModuleRoleCode[] = [
  'INSCRIPTIONS',
  'ELEVES',
  'PARENTS',
  'PROGRAMME',
  'ATELIERS',
  'LANDING',
  'UTILISATEURS',
  'FINANCE',
  'DOCUMENTS',
  'PARAMETRAGE',
]

export const DIRECTOR_JOB_TITLE = 'Directeur'

/** Ordre de redirection après connexion si l’utilisateur n’a pas accès au Home. */
export const ADMIN_LANDING_ROUTE_ORDER: Array<{ prefix: string; module: AppModuleRoleCode }> = [
  { prefix: '/admin/landing', module: 'LANDING' },
  { prefix: '/admin/inscriptions', module: 'INSCRIPTIONS' },
  { prefix: '/admin/students', module: 'ELEVES' },
  { prefix: '/admin/parents', module: 'PARENTS' },
  { prefix: '/admin/programme', module: 'PROGRAMME' },
  { prefix: '/admin/ateliers', module: 'ATELIERS' },
  { prefix: '/admin/utilisateurs', module: 'UTILISATEURS' },
  { prefix: '/admin/payments', module: 'FINANCE' },
  { prefix: '/admin/comptabilite', module: 'FINANCE' },
  { prefix: '/admin/documents', module: 'DOCUMENTS' },
  { prefix: '/admin/parametrage', module: 'PARAMETRAGE' },
]

/** Préfixe de route admin → module requis (null = Home, réservé admin + directeur). */
export const ADMIN_ROUTE_MODULES: Array<{ prefix: string; module: AppModuleRoleCode | null }> = [
  { prefix: '/admin/landing', module: 'LANDING' },
  { prefix: '/admin/inscriptions', module: 'INSCRIPTIONS' },
  { prefix: '/admin/students', module: 'ELEVES' },
  { prefix: '/admin/parents', module: 'PARENTS' },
  { prefix: '/admin/programme', module: 'PROGRAMME' },
  { prefix: '/admin/ateliers', module: 'ATELIERS' },
  { prefix: '/admin/utilisateurs', module: 'UTILISATEURS' },
  { prefix: '/admin/payments', module: 'FINANCE' },
  { prefix: '/admin/comptabilite', module: 'FINANCE' },
  { prefix: '/admin/documents', module: 'DOCUMENTS' },
  { prefix: '/admin/parametrage', module: 'PARAMETRAGE' },
  { prefix: '/admin/settings', module: 'PARAMETRAGE' },
]

export function moduleForAdminPath(path: string): AppModuleRoleCode | null | undefined {
  if (path === '/admin' || path === '/admin/') return null
  for (const { prefix, module } of ADMIN_ROUTE_MODULES) {
    if (path === prefix || path.startsWith(`${prefix}/`)) return module
  }
  return undefined
}

export function canAccessHomeFromSession(
  isSuperAdmin: boolean,
  jobTitle: string | null | undefined,
): boolean {
  if (isSuperAdmin) return true
  return String(jobTitle ?? '').trim() === DIRECTOR_JOB_TITLE
}

export function defaultAdminLandingPath(
  permissions: AppModuleRoleCode[],
  isSuperAdmin: boolean,
  canHome = false,
): string {
  if (isSuperAdmin || canHome) return '/admin'
  for (const { prefix, module } of ADMIN_LANDING_ROUTE_ORDER) {
    if (permissions.includes(module)) return prefix
  }
  return '/admin/login'
}

export function decodeAdminTokenPayload(token: string): {
  sub: string
  role: string
  permissions: AppModuleRoleCode[]
  isSuperAdmin: boolean
  jobTitle: string | null
  canAccessHome: boolean
  mustChangePassword: boolean
} | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3 || !parts[1]) return null
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const json = JSON.parse(atob(padded)) as {
      sub?: string
      role?: string
      permissions?: string[]
      mustChangePassword?: boolean
      jobTitle?: string | null
    }
    const role = String(json.role ?? '')
    const isSuperAdmin = role === 'ADMIN'
    const raw = Array.isArray(json.permissions) ? json.permissions : []
    const permissions = raw.filter((p): p is AppModuleRoleCode =>
      (ALL_APP_MODULE_ROLE_CODES as string[]).includes(String(p)),
    )
    const jobTitle =
      typeof json.jobTitle === 'string' && json.jobTitle.trim() ? json.jobTitle.trim() : null
    if (!json.sub) return null
    return {
      sub: json.sub,
      role,
      permissions: isSuperAdmin ? [...ALL_APP_MODULE_ROLE_CODES] : permissions,
      isSuperAdmin,
      jobTitle,
      canAccessHome: canAccessHomeFromSession(isSuperAdmin, jobTitle),
      mustChangePassword: Boolean(json.mustChangePassword),
    }
  } catch {
    return null
  }
}
