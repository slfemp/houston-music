<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  centered?: boolean
  light?: boolean
}>()
</script>

<template>
  <div :class="['mb-12', { 'text-center': centered }]">
    <h2 :class="[
      'font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight',
      light ? 'text-gray-900' : 'text-white'
    ]">
      {{ title }}
    </h2>
    <p 
      v-if="subtitle" 
      :class="[
        'mt-4 text-lg md:text-xl max-w-3xl leading-relaxed',
        centered ? 'mx-auto' : '',
        light ? 'text-gray-600' : 'text-text-secondary'
      ]"
    >
      {{ subtitle }}
    </p>
    <slot />
  </div>
</template>
