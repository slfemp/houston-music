<script setup lang="ts">
const currentYear = new Date().getFullYear()

const quickLinks = [
  { name: 'Home', path: '/' },
  { name: 'Bulletin Board', path: '/bulletin-board' },
  { name: 'Music Directory', path: '/music-directory' },
  { name: 'Music History', path: '/music-history' }
]

const resourceLinks = [
  { name: 'Map', path: '/map' },
  { name: 'About', path: '/about' },
  { name: 'Donate', path: '/donate' },
  { name: 'Contact', path: '/contact' }
]

const externalLinks = [
  { name: "Mayor's Office of Cultural Affairs", url: 'https://www.houstontx.gov/moca/' },
  { name: 'Texas Music Office', url: 'https://gov.texas.gov/music' },
  { name: 'Houston Arts Alliance', url: 'https://www.houstonartsalliance.com/' }
]
</script>

<template>
  <footer class="bg-space-black border-t border-white/10 pt-16 pb-8">
    <div class="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
      <!-- Main footer content -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        <!-- About -->
        <div>
          <h3 class="font-display text-xl font-bold text-white mb-4">
            Houston Music Advisory Board
          </h3>
          <p class="text-text-secondary text-sm leading-relaxed mb-6">
            Advancing Houston's music industry and supporting cultural tourism through community engagement and strategic initiatives.
          </p>
          <!-- Social icons placeholder -->
          <div class="flex gap-4">
            <a 
              href="https://www.instagram.com/houstonmusicadvisoryboard/"
              target="_blank"
              rel="noopener noreferrer"
              class="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-electric-blue/20 hover:text-electric-blue transition-all text-text-secondary"
              aria-label="Instagram"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a 
              href="https://www.facebook.com/houstonmusicadvisoryboard"
              target="_blank"
              rel="noopener noreferrer"
              class="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-electric-blue/20 hover:text-electric-blue transition-all text-text-secondary"
              aria-label="Facebook"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          </div>
        </div>
        
        <!-- Quick Links -->
        <div>
          <h4 class="text-sm font-semibold text-white tracking-wider uppercase mb-4">
            Quick Links
          </h4>
          <ul class="space-y-3">
            <li v-for="link in quickLinks" :key="link.path">
              <NuxtLink 
                :to="link.path" 
                class="text-text-secondary hover:text-electric-blue transition-colors duration-200"
              >
                {{ link.name }}
              </NuxtLink>
            </li>
          </ul>
        </div>
        
        <!-- Resources -->
        <div>
          <h4 class="text-sm font-semibold text-white tracking-wider uppercase mb-4">
            Resources
          </h4>
          <ul class="space-y-3">
            <li v-for="link in resourceLinks" :key="link.path">
              <NuxtLink 
                :to="link.path" 
                class="text-text-secondary hover:text-electric-blue transition-colors duration-200"
              >
                {{ link.name }}
              </NuxtLink>
            </li>
          </ul>
        </div>
        
        <!-- Partners -->
        <div>
          <h4 class="text-sm font-semibold text-white tracking-wider uppercase mb-4">
            Partners
          </h4>
          <ul class="space-y-3">
            <li v-for="link in externalLinks" :key="link.url">
              <a 
                :href="link.url" 
                target="_blank"
                rel="noopener noreferrer"
                class="text-text-secondary hover:text-electric-blue transition-colors duration-200 inline-flex items-center"
              >
                {{ link.name }}
                <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
              </a>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- Bottom bar -->
      <div class="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-text-muted">
        <div>
          &copy; {{ currentYear }} Houston Music Advisory Board. All rights reserved.
        </div>
        <div class="flex gap-6">
          <NuxtLink to="/contact" class="hover:text-electric-blue transition-colors">
            Contact
          </NuxtLink>
          <a 
            href="https://forms.gle/Jg92Ms4wnG7ZaSXz5"
            target="_blank"
            rel="noopener noreferrer"
            class="px-6 py-2 bg-electric-blue text-space-black font-semibold rounded-full hover:bg-white transition-all"
          >
            RSVP Now
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
