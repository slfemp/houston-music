<script setup lang="ts">
defineProps<{
  href: string
  variant?: 'primary' | 'secondary' | 'accent' | 'gold'
  external?: boolean
  size?: 'sm' | 'md' | 'lg'
}>()

const variantClasses = {
  primary: 'bg-electric-blue text-space-black hover:bg-white hover:scale-105',
  secondary: 'bg-white/10 backdrop-blur text-white border border-white/20 hover:bg-white/20',
  accent: 'bg-electric-purple text-white hover:bg-neon-pink hover:scale-105',
  gold: 'bg-gold-accent text-space-black hover:bg-white hover:scale-105'
}

const sizeClasses = {
  sm: 'px-5 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg'
}
</script>

<template>
  <a
    v-if="external"
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    :class="[
      'inline-flex items-center justify-center font-bold rounded-full transition-all duration-300',
      variantClasses[variant || 'primary'],
      sizeClasses[size || 'md']
    ]"
  >
    <slot />
    <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
    </svg>
  </a>
  <NuxtLink
    v-else
    :to="href"
    :class="[
      'inline-flex items-center justify-center font-bold rounded-full transition-all duration-300',
      variantClasses[variant || 'primary'],
      sizeClasses[size || 'md']
    ]"
  >
    <slot />
  </NuxtLink>
</template>
