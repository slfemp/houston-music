/**
 * Guards the board console. Applied per-page rather than globally so the
 * public site stays reachable without a session. Resolves the magic-link
 * session into a board user and caches it for useBoardUser().
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const user = useState<any>('board-user', () => null)

  if (!user.value) {
    // useRequestFetch forwards the incoming event during SSR — a plain $fetch
    // would spawn an internal request with no Cloudflare bindings (no D1).
    const requestFetch = useRequestFetch()
    try {
      const me = await requestFetch<{ admin: any; boardUser: any }>('/api/auth/me')
      user.value = me.boardUser || null
    } catch {
      user.value = null
    }
  }

  if (!user.value) {
    return navigateTo(`/board/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
