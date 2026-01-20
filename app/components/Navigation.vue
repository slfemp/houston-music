<script setup lang="ts">
const route = useRoute()
const isMenuOpen = ref(false)

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Bulletin Board', path: '/bulletin-board' },
  { name: 'Music Directory', path: '/music-directory' },
  { name: 'Music History', path: '/music-history' },
  { name: 'Map', path: '/map' },
  { name: 'About', path: '/about' },
  { name: 'Donate', path: '/donate' },
  { name: 'Contact', path: '/contact' }
]

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

const closeMenu = () => {
  isMenuOpen.value = false
}

// Close menu on route change
watch(() => route.path, () => closeMenu())
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50 bg-space-black/80 backdrop-blur-lg border-b border-white/10">
    <nav class="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
      <div class="flex justify-between items-center h-20">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center space-x-3">
          <div class="text-2xl font-display font-bold text-white tracking-tight">
            HMAB
          </div>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <div class="hidden lg:flex items-center space-x-8">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            :class="[
              'text-sm font-medium transition-colors duration-200 tracking-wider uppercase',
              isActive(link.path)
                ? 'text-electric-blue'
                : 'text-text-secondary hover:text-electric-blue'
            ]"
          >
            {{ link.name }}
          </NuxtLink>
          
          <!-- CTA Button -->
          <a 
            href="https://forms.gle/Jg92Ms4wnG7ZaSXz5"
            target="_blank"
            rel="noopener noreferrer"
            class="px-6 py-3 bg-electric-blue text-space-black font-semibold rounded-full hover:bg-white transition-all duration-300 hover:scale-105"
          >
            RSVP
          </a>
        </div>

        <!-- Mobile menu button -->
        <button
          @click="isMenuOpen = !isMenuOpen"
          class="lg:hidden p-2 text-white focus:outline-none"
          aria-label="Toggle menu"
          :aria-expanded="isMenuOpen"
        >
          <svg v-if="!isMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </nav>

    <!-- Full-screen Mobile Menu -->
    <Transition name="menu">
      <div v-if="isMenuOpen" class="fixed inset-0 z-50 bg-space-black lg:hidden">
        <div class="flex flex-col h-full">
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-white/10">
            <div class="text-2xl font-display font-bold text-white">HMAB</div>
            <button @click="closeMenu" class="text-white p-2">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <!-- Menu items -->
          <nav class="flex-1 flex flex-col justify-center px-6">
            <NuxtLink 
              v-for="link in navLinks"
              :key="link.path"
              :to="link.path"
              :class="[
                'text-4xl font-display font-bold transition-colors duration-200 py-4',
                isActive(link.path) ? 'text-electric-blue' : 'text-white hover:text-electric-blue'
              ]"
              @click="closeMenu"
            >
              {{ link.name }}
            </NuxtLink>
          </nav>
          
          <!-- Footer -->
          <div class="p-6 border-t border-white/10">
            <a 
              href="https://forms.gle/Jg92Ms4wnG7ZaSXz5"
              target="_blank"
              rel="noopener noreferrer"
              class="block w-full px-8 py-4 bg-electric-blue text-space-black font-bold rounded-full text-center hover:bg-white transition-all"
            >
              RSVP Now
            </a>
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
