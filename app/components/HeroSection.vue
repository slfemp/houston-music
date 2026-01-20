<script setup lang="ts">
const props = defineProps<{
  title: string
  subtitle?: string
  image?: string
  imageAlt?: string
  overlay?: boolean
  fullHeight?: boolean
}>()

// Default to Houston skyline if no image provided
const backgroundImage = computed(() => props.image ?? '/images/htownskyline.jpg')
</script>

<template>
  <section :class="[
    'relative bg-space-black overflow-hidden',
    fullHeight ? 'min-h-screen' : ''
  ]">
    <!-- Background image - defaults to Houston skyline -->
    <div class="absolute inset-0">
      <img 
        :src="backgroundImage" 
        :alt="imageAlt || title"
        class="w-full h-full object-cover opacity-40"
      />
      <div 
        v-if="overlay !== false"
        class="absolute inset-0 bg-gradient-to-b from-space-black/70 via-space-black/40 to-space-black"
      />
    </div>

    <!-- Content -->
    <div :class="[
      'relative max-w-7xl mx-auto px-6 md:px-8 lg:px-12',
      fullHeight ? 'min-h-screen flex items-center' : 'py-16 md:py-24 lg:py-32'
    ]">
      <div class="text-center w-full">
        <h1 class="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
          {{ title }}
        </h1>
        <p 
          v-if="subtitle" 
          class="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto leading-relaxed"
        >
          {{ subtitle }}
        </p>
        <slot />
      </div>
    </div>
  </section>
</template>
