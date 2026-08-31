import { checkAdminAccessToken } from '~/utils/admin-token'

/** Sur /admin/login : si déjà connecté en tant qu’admin, aller au dashboard. */
export default defineNuxtRouteMiddleware((to) => {
  if (to.path !== '/admin/login') return
  if (checkAdminAccessToken(useAuth().token.value).ok) {
    return navigateTo(useAdminPermissions().adminLandingPath())
  }
})
