import { checkAdminAccessToken } from '~/utils/admin-token'

export default defineNuxtRouteMiddleware((to) => {
  if (!to.path.startsWith('/admin')) return
  if (to.path === '/admin/login') return

  const auth = useAuth()
  const raw = auth.token.value
  const check = checkAdminAccessToken(raw)

  if (!check.ok) {
    auth.logout()
    return navigateTo('/admin/login')
  }

  const changePasswordPath = '/admin/changer-mot-de-passe'
  if (check.mustChangePassword && to.path !== changePasswordPath) {
    return navigateTo(changePasswordPath)
  }

  const perms = useAdminPermissions()
  const landing = perms.adminLandingPath()

  if (!check.mustChangePassword && to.path === changePasswordPath) {
    return navigateTo(landing)
  }

  if (
    (to.path === '/admin' || to.path === '/admin/') &&
    !perms.canAccessHome.value
  ) {
    return navigateTo(landing)
  }

  if (!perms.canAccessAdminPath(to.path)) {
    return navigateTo(landing)
  }
})
