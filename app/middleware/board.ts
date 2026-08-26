/**
 * Guards the board console. Applied per-page rather than globally so the
 * public site stays reachable without a session.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn, fetch: refreshSession } = useUserSession()

  // On a hard load the session state is not populated yet.
  if (!loggedIn.value) await refreshSession()

  if (!loggedIn.value) {
    return navigateTo(`/board/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
