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
        // Primary - Deep space blacks and dark grays
        'space-black': '#000000',
        'space-dark': '#0B0B0D',
        'space-gray': '#1a1a1a',
        'space-gray-light': '#2a2a2a',
        
        // Accent - Vibrant blues and purples (music + space)
        'electric-blue': '#00D9FF',
        'electric-purple': '#9D4EDD',
        'neon-pink': '#FF006E',
        'gold-accent': '#FFB700',
        
        // Text
        'text-primary': '#FFFFFF',
        'text-secondary': '#B4B4B4',
        'text-muted': '#6B7280',

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
