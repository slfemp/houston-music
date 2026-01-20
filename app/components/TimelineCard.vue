<script setup lang="ts">
import type { TimelineEvent } from '~/data/timeline'

defineProps<{
  event: TimelineEvent
}>()
</script>

<template>
  <article class="bg-space-gray rounded-2xl overflow-hidden border border-white/5 hover:border-electric-blue/50 transition-all duration-300 group hover:shadow-2xl hover:shadow-electric-blue/10">
    <!-- Image -->
    <div class="aspect-square bg-space-gray-light relative overflow-hidden">
      <img 
        v-if="event.image"
        :src="event.image" 
        :alt="`${event.title} - ${event.year}`"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
        @error="($event.target as HTMLImageElement).style.display = 'none'"
      />
      <!-- Fallback when no image -->
      <div 
        v-if="!event.image"
        class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-electric-blue/20 to-electric-purple/20"
      >
        <svg class="w-16 h-16 text-white/30" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
      </div>
      
      <!-- Gradient overlay on hover -->
      <div class="absolute inset-0 bg-gradient-to-t from-space-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <!-- Year badge -->
      <div class="absolute top-3 left-3">
        <span class="bg-electric-blue text-space-black px-3 py-1 text-sm font-bold rounded-full shadow-lg">
          {{ event.year }}
        </span>
      </div>
    </div>

    <!-- Content -->
    <div class="p-6">
      <h3 class="font-display font-semibold text-xl text-white mb-3 line-clamp-2 group-hover:text-electric-blue transition-colors">
        {{ event.title }}
      </h3>
      <p class="text-text-secondary text-sm leading-relaxed line-clamp-3">
        {{ event.description }}
      </p>
    </div>
  </article>
</template>
