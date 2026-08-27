<script setup lang="ts">
const { user } = useBoardUser()
const route = useRoute()
const menuOpen = ref(false)
const openGroup = ref<string | null>(null)

// Three wings of the console. More groups land here as the work grows.
const groups = [
  {
    label: 'Music Board',
    links: [
      { to: '/board', label: 'Dashboard' },
      { to: '/board/meetings', label: 'Meetings' },
      { to: '/board/calendar', label: 'Calendar' },
      { to: '/board/members', label: 'Members' },
      { to: '/board/issues', label: 'Issues' },
      { to: '/board/events', label: 'Events' },
      { to: '/board/volunteers', label: 'Volunteers' },
      { to: '/board/documents', label: 'Documents' },
    ],
  },
  {
    label: 'Intelligence',
    links: [
      { to: '/board/network', label: 'Network' },
      { to: '/board/graph', label: 'Graph' },
      { to: '/board/map', label: 'Map' },
      { to: '/board/contacts', label: 'Contacts' },
      { to: '/board/venues', label: 'Venues' },
      { to: '/board/musicians', label: 'Musicians' },
    ],
  },
  {
    label: 'Fundraising',
    links: [
      { to: '/board/finance', label: 'Finance' },
      { to: '/board/merch', label: 'Merch' },
    ],
  },
]

const isActive = (to: string) => (to === '/board' ? route.path === '/board' : route.path.startsWith(to))
const groupActive = (g: (typeof groups)[number]) => g.links.some((l) => isActive(l.to))

// ── Theme (console-only; the public site stays on the dark brand) ──
const lightMode = ref(false)
function applyTheme() {
  document.documentElement.classList.toggle('hmab-light', lightMode.value)
}
function toggleTheme() {
  lightMode.value = !lightMode.value
  try { localStorage.setItem('hmab-theme', lightMode.value ? 'light' : 'dark') } catch {}
  applyTheme()
}
onMounted(() => {
  try { lightMode.value = localStorage.getItem('hmab-theme') === 'light' } catch {}
  applyTheme()
})
onBeforeUnmount(() => document.documentElement.classList.remove('hmab-light'))

// ── TEMPORARY page explainers — delete this block (and its render below)
//    once the board knows its way around. ──
const pageIntros: Record<string, string> = {
  '/board': "Your home base — the next meeting, quorum status, treasury balance, open issues, and the board's voting record at a glance.",
  '/board/meetings': 'Schedule meetings, post agendas, run motions with roll-call votes, take attendance, and record minutes. The full parliamentary flow lives here.',
  '/board/calendar': 'Every meeting and event on one calendar. Subscribe from your phone or any calendar app with the feed link.',
  '/board/members': 'The official roster — who holds each seat, positions, terms, and who counts toward quorum.',
  '/board/issues': 'Post anything the board should act on. Members add support to rank it, then an officer schedules it onto a meeting agenda where it becomes a motion and gets voted.',
  '/board/events': 'Public events the board hosts or supports, with RSVPs. What lands here can feed the public Bulletin Board.',
  '/board/volunteers': 'Volunteer opportunities and community sign-ups for board events.',
  '/board/documents': 'Board records — the Guidelines Handbook (board eyes only) plus the public documents, and a quick reference of the governance rules.',
  '/board/network': 'The intelligence database: every person, organization, venue, event, and program in the Houston music network. Add, edit, connect, approve or delete anything.',
  '/board/graph': 'The same network drawn as a living map of connections. Click any node to see who and what it touches.',
  '/board/map': 'Every venue in the network plotted across the metro — the physical shape of the Houston music scene.',
  '/board/contacts': 'The private contact directory — emails and phones for the network. Never shown on the public site.',
  '/board/venues': 'The booking directory: artist-facing details (who books, what they pay, backline) layered on vetted venues from the Network. Published entries feed the public venues page.',
  '/board/musicians': 'The musician directory and its moderation queue — public submissions land here for approval.',
  '/board/finance': "The board's money — accounts, transactions, budget lines, and treasurer reports for every meeting.",
  '/board/merch': 'Merch catalog for fundraising. Published items appear on the public site.',
}
const pageIntro = computed(() => pageIntros[route.path])

function toggleGroup(label: string) {
  openGroup.value = openGroup.value === label ? null : label
}
watch(() => route.path, () => { openGroup.value = null; menuOpen.value = false })

async function signOut() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  useState('board-user').value = null
  await navigateTo('/board/login')
}
</script>

<template>
  <div class="min-h-screen bg-space-black text-white flex flex-col" @click="openGroup = null">
    <header class="border-b border-white/10 bg-space-dark/95 backdrop-blur-sm sticky top-0 z-40">
      <div class="px-4 sm:px-6">
        <div class="flex items-center justify-between h-16">
          <NuxtLink to="/board" class="font-display font-bold text-lg text-white shrink-0">
            HMAB <span class="text-electric-blue">Console</span>
          </NuxtLink>

          <nav class="hidden md:flex items-center gap-1 mx-6" @click.stop>
            <div v-for="g in groups" :key="g.label" class="relative">
              <button
                class="px-4 py-2 text-sm rounded-lg transition-colors flex items-center gap-1.5"
                :class="groupActive(g) || openGroup === g.label
                  ? 'bg-electric-blue/15 text-electric-blue'
                  : 'text-text-secondary hover:text-white hover:bg-white/5'"
                @click="toggleGroup(g.label)"
              >
                {{ g.label }}
                <svg class="w-3 h-3 transition-transform" :class="openGroup === g.label ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                v-if="openGroup === g.label"
                class="absolute left-0 top-full mt-1 w-52 bg-space-gray border border-white/15 rounded-xl py-2 shadow-2xl shadow-black/60"
              >
                <NuxtLink
                  v-for="l in g.links" :key="l.to" :to="l.to"
                  class="block px-4 py-2 text-sm transition-colors"
                  :class="isActive(l.to) ? 'text-electric-blue bg-white/5' : 'text-text-secondary hover:text-white hover:bg-white/5'"
                >{{ l.label }}</NuxtLink>
              </div>
            </div>
          </nav>

          <div class="flex items-center gap-3">
            <div class="hidden sm:block text-right leading-tight whitespace-nowrap">
              <div class="text-sm font-medium">{{ (user as any)?.name?.split(' ')[0] }}</div>
              <div class="text-xs text-text-muted capitalize">{{ (user as any)?.role }}</div>
            </div>
            <button
              class="p-2 rounded-lg border border-white/15 text-text-secondary hover:text-white hover:border-white/30 transition-colors"
              :title="lightMode ? 'Switch to dark mode' : 'Switch to light mode'"
              @click="toggleTheme"
            >
              <svg v-if="lightMode" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </button>
            <button
              class="text-xs px-3 py-1.5 rounded-lg border border-white/15 text-text-secondary hover:text-white hover:border-white/30 transition-colors"
              @click="signOut"
            >Sign out</button>
            <button
              class="md:hidden p-2 -mr-2 text-white" aria-label="Toggle navigation"
              @click.stop="menuOpen = !menuOpen"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        <nav v-if="menuOpen" class="md:hidden pb-4 space-y-4" @click.stop>
          <div v-for="g in groups" :key="g.label">
            <div class="px-3 pt-2 pb-1 text-[11px] uppercase tracking-wider text-text-muted">{{ g.label }}</div>
            <div class="grid grid-cols-2 gap-1">
              <NuxtLink
                v-for="l in g.links" :key="l.to" :to="l.to"
                class="px-3 py-2 text-sm rounded-lg"
                :class="isActive(l.to) ? 'text-electric-blue bg-white/5' : 'text-text-secondary hover:text-white hover:bg-white/5'"
                @click="menuOpen = false"
              >{{ l.label }}</NuxtLink>
            </div>
          </div>
        </nav>
      </div>
    </header>

    <main class="flex-1 w-full px-4 sm:px-6 py-8">
      <!-- TEMPORARY page explainer — remove with the pageIntros block above -->
      <div
        v-if="pageIntro"
        class="mb-6 px-5 py-3.5 rounded-xl bg-electric-blue/10 border border-electric-blue/25 text-sm text-text-secondary flex gap-3"
      >
        <span class="text-electric-blue shrink-0 font-bold">ⓘ</span>
        <span>{{ pageIntro }}</span>
      </div>
      <slot />
    </main>

    <footer class="border-t border-white/10 py-4">
      <div class="px-4 sm:px-6 flex flex-wrap gap-x-4 gap-y-1 justify-between text-xs text-text-muted">
        <span>Houston Music Advisory Board — internal console</span>
        <NuxtLink to="/" class="hover:text-electric-blue transition-colors">View public site →</NuxtLink>
      </div>
    </footer>
  </div>
</template>
