<script setup lang="ts">
const route = useRoute()
const isMenuOpen = ref(false)

/**
 * Primary navigation. Volunteer and Donate are deliberately kept out of this
 * list and rendered as buttons - they are the two actions the site is asking
 * people to take, and a link in a row of nine reads as neither.
 */
const navLinks = [
  { name: 'Events', path: '/events' },
  { name: 'Musicians', path: '/musicians' },
  { name: 'Venues', path: '/venues' },
  { name: 'Map', path: '/map' },
  { name: 'History', path: '/music-history' },
  { name: 'Merch', path: '/merch' },
  { name: 'About', path: '/about' },
]

/** Reachable but not competing for space in the primary row. */
const secondaryLinks = [
  { name: 'Bulletin Board', path: '/bulletin-board' },
  { name: 'Music Directory', path: '/music-directory' },
  { name: 'Contact', path: '/contact' },
]

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

const closeMenu = () => { isMenuOpen.value = false }
watch(() => route.path, () => closeMenu())

// Lock body scroll while the full-screen mobile menu is open.
watch(isMenuOpen, (open) => {
  if (import.meta.client) document.body.style.overflow = open ? 'hidden' : ''
})
onUnmounted(() => { if (import.meta.client) document.body.style.overflow = '' })
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50 bg-space-black/80 backdrop-blur-lg border-b border-white/10">
    <nav class="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
      <div class="flex justify-between items-center h-20 gap-4">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-3 shrink-0 group">
          <div class="text-2xl font-display font-bold text-white tracking-tight group-hover:text-electric-blue transition-colors">
            HMAB
          </div>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <div class="hidden lg:flex items-center gap-6 xl:gap-7">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            class="relative text-[13px] font-medium transition-colors duration-200 tracking-wider uppercase py-1"
            :class="isActive(link.path) ? 'text-electric-blue' : 'text-text-secondary hover:text-white'"
          >
            {{ link.name }}
            <span
              class="absolute -bottom-0.5 left-0 h-px bg-electric-blue transition-all duration-300"
              :class="isActive(link.path) ? 'w-full' : 'w-0'"
            />
          </NuxtLink>
        </div>

        <!-- Desktop CTAs -->
        <div class="hidden lg:flex items-center gap-3 shrink-0">
          <NuxtLink
            to="/volunteer"
            class="px-5 py-2.5 text-sm font-semibold rounded-full border border-white/20 text-white hover:border-electric-blue hover:text-electric-blue transition-colors duration-300"
          >Volunteer</NuxtLink>
          <NuxtLink
            to="/donate"
            class="px-5 py-2.5 text-sm bg-electric-blue text-space-black font-bold rounded-full hover:bg-white transition-all duration-300 hover:scale-105"
          >Donate</NuxtLink>
        </div>

        <!-- Mobile menu button -->
        <button
          class="lg:hidden p-2 -mr-2 text-white focus:outline-hidden focus-visible:ring-2 focus-visible:ring-electric-blue rounded-lg"
          aria-label="Toggle menu"
          :aria-expanded="isMenuOpen"
          @click="isMenuOpen = !isMenuOpen"
        >
          <svg v-if="!isMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </nav>

    <!-- Full-screen Mobile Menu -->
    <Transition name="menu">
      <div v-if="isMenuOpen" class="fixed inset-0 z-50 bg-space-black lg:hidden">
        <div class="flex flex-col h-full">
          <div class="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
            <div class="text-2xl font-display font-bold text-white">HMAB</div>
            <button class="text-white p-2 -mr-2" aria-label="Close menu" @click="closeMenu">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Scrolls rather than compressing: nine items do not fit a short viewport -->
          <nav class="flex-1 overflow-y-auto px-6 py-6">
            <NuxtLink
              v-for="link in navLinks"
              :key="link.path"
              :to="link.path"
              class="block text-3xl font-display font-bold transition-colors duration-200 py-3"
              :class="isActive(link.path) ? 'text-electric-blue' : 'text-white hover:text-electric-blue'"
              @click="closeMenu"
            >{{ link.name }}</NuxtLink>
            <NuxtLink
              v-for="link in secondaryLinks" :key="link.path" :to="link.path"
              class="block text-xl font-display font-semibold py-2.5 transition-colors duration-200"
              :class="isActive(link.path) ? 'text-electric-blue' : 'text-text-secondary hover:text-electric-blue'"
              @click="closeMenu"
            >{{ link.name }}</NuxtLink>
          </nav>

          <div class="p-6 border-t border-white/10 grid grid-cols-2 gap-3 shrink-0">
            <NuxtLink
              to="/volunteer"
              class="px-6 py-3.5 border border-white/20 text-white font-semibold rounded-full text-center hover:border-electric-blue hover:text-electric-blue transition-colors"
              @click="closeMenu"
            >Volunteer</NuxtLink>
            <NuxtLink
              to="/donate"
              class="px-6 py-3.5 bg-electric-blue text-space-black font-bold rounded-full text-center hover:bg-white transition-all"
              @click="closeMenu"
            >Donate</NuxtLink>
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.menu-enter-active,
.menu-leave-active {
  transition: opacity 0.3s ease;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
}
</style>
