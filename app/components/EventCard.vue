<script setup lang="ts">
import type { Event } from '~/data/events'

const props = defineProps<{
  event: Event
}>()

const formattedDate = computed(() => {
  const date = new Date(props.event.date)
  return {
    month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    day: date.getDate(),
    year: date.getFullYear()
  }
})

const categoryColors: Record<string, string> = {
  meeting: 'bg-electric-blue/10 text-electric-blue border-electric-blue/20',
  workshop: 'bg-electric-purple/10 text-electric-purple border-electric-purple/20',
  event: 'bg-neon-pink/10 text-neon-pink border-neon-pink/20',
  announcement: 'bg-gold-accent/10 text-gold-accent border-gold-accent/20'
}

const categoryLabels: Record<string, string> = {
  meeting: 'Meeting',
  workshop: 'Workshop',
  event: 'Event',
  announcement: 'Announcement'
}
</script>

<template>
  <article class="flex flex-col md:flex-row gap-6 p-6 md:p-8 bg-space-gray rounded-2xl border border-white/5 hover:border-electric-purple/50 transition-all duration-300 group">
    <!-- Date Block (prominent) -->
    <div class="flex-shrink-0 w-full md:w-32 text-center md:text-left">
      <div class="inline-block md:block bg-electric-purple/10 rounded-xl p-4 border border-electric-purple/20">
        <div class="text-4xl font-display font-bold text-electric-purple">
          {{ formattedDate.day }}
        </div>
        <div class="text-sm text-text-secondary uppercase tracking-wider">
          {{ formattedDate.month }} {{ formattedDate.year }}
        </div>
      </div>
    </div>
    
    <!-- Event Details -->
    <div class="flex-1">
      <!-- Category badge -->
      <span :class="['inline-block px-3 py-1 text-xs font-semibold tracking-wider uppercase rounded-full border mb-3', categoryColors[event.category] || categoryColors.event]">
        {{ categoryLabels[event.category] || 'Event' }}
      </span>
      
      <!-- Title -->
      <h3 class="font-display text-2xl font-bold text-white mb-2 group-hover:text-electric-purple transition-colors">
        {{ event.title }}
      </h3>
      
      <!-- Meta info -->
      <div class="flex flex-wrap gap-4 mb-4 text-sm text-text-secondary">
        <div class="flex items-center">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {{ event.time }}
        </div>
        <div class="flex items-center">
          <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <span class="line-clamp-1">{{ event.location }}</span>
        </div>
      </div>
      
      <!-- Description -->
      <p class="text-text-secondary leading-relaxed mb-4 line-clamp-2">
        {{ event.description }}
      </p>
      
      <!-- RSVP Button -->
      <a
        v-if="event.rsvpLink"
        :href="event.rsvpLink"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center px-6 py-3 bg-electric-purple/10 text-electric-purple font-semibold rounded-full border border-electric-purple/20 hover:bg-electric-purple hover:text-space-black transition-all"
      >
        RSVP Now
        <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
        </svg>
      </a>
    </div>
  </article>
</template>
