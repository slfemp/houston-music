<script setup lang="ts">
const { user, isOfficer, canEdit } = useBoardUser()
const { clear } = useUserSession()
const route = useRoute()
const menuOpen = ref(false)

const links = computed(() => [
  { to: '/board', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/board/calendar', label: 'Calendar' },
  { to: '/board/meetings', label: 'Meetings' },
  { to: '/board/issues', label: 'Issues' },
  { to: '/board/finance', label: 'Finance' },
  { to: '/board/events', label: 'Events' },
  { to: '/board/merch', label: 'Merch' },
  { to: '/board/volunteers', label: 'Volunteers' },
  { to: '/board/musicians', label: 'Musicians' },
  { to: '/board/venues', label: 'Venues' },
  { to: '/board/members', label: 'Members' },
])

async function signOut() {
  await clear()
  await navigateTo('/board/login')
}
</script>

<template>
  <div class="min-h-screen bg-space-black text-white flex flex-col">
    <header class="border-b border-white/10 bg-space-dark/95 backdrop-blur-sm sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-3 min-w-0">
            <NuxtLink to="/board" class="font-display font-bold text-lg text-white shrink-0">
              HMAB <span class="text-electric-blue">Console</span>
            </NuxtLink>
          </div>

          <nav class="hidden xl:flex items-center gap-0.5">
            <NuxtLink
              v-for="link in links" :key="link.to" :to="link.to"
              class="px-2.5 py-2 text-[13px] rounded-lg transition-colors whitespace-nowrap"
              :class="route.path === link.to || (link.to !== '/board' && route.path.startsWith(link.to))
                ? 'bg-electric-blue/15 text-electric-blue'
                : 'text-text-secondary hover:text-white hover:bg-white/5'"
            >{{ link.label }}</NuxtLink>
          </nav>

          <div class="flex items-center gap-3">
            <div class="hidden sm:block text-right leading-tight">
              <div class="text-sm font-medium">{{ (user as any)?.name }}</div>
              <div class="text-xs text-text-muted capitalize">{{ (user as any)?.role }}</div>
            </div>
            <button
              class="text-xs px-3 py-1.5 rounded-lg border border-white/15 text-text-secondary hover:text-white hover:border-white/30 transition-colors"
              @click="signOut"
            >Sign out</button>
            <button
              class="xl:hidden p-2 -mr-2 text-white" aria-label="Toggle navigation"
              @click="menuOpen = !menuOpen"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        <nav v-if="menuOpen" class="xl:hidden pb-4 grid grid-cols-2 sm:grid-cols-3 gap-1">
          <NuxtLink
            v-for="link in links" :key="link.to" :to="link.to"
            class="px-3 py-2 text-sm rounded-lg text-text-secondary hover:text-white hover:bg-white/5"
            @click="menuOpen = false"
          >{{ link.label }}</NuxtLink>
        </nav>
      </div>
    </header>

    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
      <slot />
    </main>

    <footer class="border-t border-white/10 py-4">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap gap-x-4 gap-y-1 justify-between text-xs text-text-muted">
        <span>Houston Music Advisory Board — internal console</span>
        <NuxtLink to="/" class="hover:text-electric-blue transition-colors">View public site →</NuxtLink>
      </div>
    </footer>
  </div>
</template>
