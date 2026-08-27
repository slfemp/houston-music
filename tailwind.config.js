/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue'
  ],
  theme: {
    extend: {
      colors: {
        // Surfaces + text are CSS-variable driven so the board console can flip
        // to light mode (html.hmab-light). Defaults in main.css keep the public
        // site permanently on the dark brand.
        white: 'rgb(var(--hm-ink) / <alpha-value>)',
        'space-black': 'rgb(var(--hm-bg) / <alpha-value>)',
        'space-dark': 'rgb(var(--hm-bg-2) / <alpha-value>)',
        'space-gray': 'rgb(var(--hm-surface) / <alpha-value>)',
        'space-gray-light': 'rgb(var(--hm-surface-2) / <alpha-value>)',

        // Accent - Vibrant blues and purples (music + space)
        'electric-blue': '#00D9FF',
        'electric-purple': '#9D4EDD',
        'neon-pink': '#FF006E',
        'gold-accent': '#FFB700',

        // Text
        'text-primary': 'rgb(var(--hm-ink) / <alpha-value>)',
        'text-secondary': 'rgb(var(--hm-text-2) / <alpha-value>)',
        'text-muted': 'rgb(var(--hm-text-3) / <alpha-value>)',

        // Legacy colors (for gradual migration)
        primary: {
          DEFAULT: '#1e3a8a',
          light: '#3b82f6',
          dark: '#1e40af',
          50: '#eff6ff',
          100: '#dbeafe',
        },
        accent: {
          DEFAULT: '#8b5cf6',
          light: '#a78bfa',
          dark: '#7c3aed',
          gold: '#f59e0b'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif']
      }
    }
  },
  plugins: []
}
