import {
  ALL_APP_MODULE_ROLE_CODES,
  APP_MODULE_ROLE_LABELS,
  decodeAdminTokenPayload,
  defaultAdminLandingPath,
  moduleForAdminPath,
  type AppModuleRoleCode,
} from '~/utils/admin-permissions'

export function useAdminPermissions() {
  const { token } = useAuth()

  const session = computed(() => {
    const t = token.value
    if (!t) return null
    return decodeAdminTokenPayload(t)
  })

  const isSuperAdmin = computed(() => session.value?.isSuperAdmin ?? false)
  const permissions = computed(() => session.value?.permissions ?? [])
  const currentUserId = computed(() => session.value?.sub ?? null)
  const canAccessHome = computed(() => session.value?.canAccessHome ?? false)

  function canAccessModule(module: AppModuleRoleCode): boolean {
    if (isSuperAdmin.value) return true
    return permissions.value.includes(module)
  }

  function canAccessAdminPath(path: string): boolean {
    if (path === '/admin/donnees' || path.startsWith('/admin/donnees/')) {
      return isSuperAdmin.value
    }
    const mod = moduleForAdminPath(path)
    if (mod === undefined) return true
    if (mod === null) return canAccessHome.value
    return canAccessModule(mod)
  }

  function adminLandingPath(): string {
    return defaultAdminLandingPath(
      permissions.value,
      isSuperAdmin.value,
      canAccessHome.value,
    )
  }

  const roleOptions = computed(() =>
    ALL_APP_MODULE_ROLE_CODES.map((code) => ({
      code,
      label: APP_MODULE_ROLE_LABELS[code],
    })),
  )

  return {
    session,
    isSuperAdmin,
    permissions,
    currentUserId,
    canAccessHome,
    canAccessModule,
    canAccessAdminPath,
    adminLandingPath,
    roleOptions,
  }
}
