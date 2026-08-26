import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-08-25',
  devtools: { enabled: true },
  ssr: true,

  modules: ['nuxt-auth-utils'],

  /**
   * Hybrid rendering. The public marketing pages are prerendered exactly as
   * before; the board area is a client-rendered SPA behind auth, and /api/**
   * runs as a server function. A fully static build can no longer be used
   * because the board needs a live database.
   */
  routeRules: {
    '/': { prerender: true },
    '/about': { prerender: true },
    '/music-history': { prerender: true },
    '/music-directory': { prerender: true },
    '/donate': { prerender: true },
    '/contact': { prerender: true },
    '/map': { prerender: true },
    '/success': { prerender: true },
    // Public pages that read live data - revalidated rather than frozen
    '/bulletin-board': { swr: 300 },
    '/meetings/**': { swr: 300 },
    '/volunteer': { swr: 60 },
    // Authenticated board console
    '/board/**': { ssr: false },
  },

  nitro: {
    experimental: { openAPI: false },
  },

  vite: {
    plugins: [tailwindcss()]
  },

  css: [
    '~/assets/css/main.css'
  ],

  app: {
    head: {
      title: 'Houston Music Advisory Board',
      htmlAttrs: {
        lang: 'en'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { 
          name: 'description', 
          content: 'Welcome to Houston\'s music community! Resources for musicians and music industry professionals.' 
        },
        { property: 'og:title', content: 'Houston Music Advisory Board' },
        { property: 'og:description', content: 'Welcome to Houston\'s music community! Resources for musicians and music industry professionals.' },
        { property: 'og:type', content: 'website' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap' }
      ]
    }
  },

  runtimeConfig: {
    // Overridden by NUXT_SESSION_PASSWORD - must be >= 32 chars in production
    session: {
      name: 'hmab_session',
      cookie: { sameSite: 'lax' },
    },
    /** Spending at or above this many cents needs a board motion, not just the treasurer. */
    expenditureApprovalThresholdCents: '50000',
    public: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
      orgName: 'Houston Music Advisory Board',
    }
  }
})
