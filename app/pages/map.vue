<script setup lang="ts">
import { venues, venueTypes } from '~/data/venues'

useHead({
  title: 'Music Map - Houston Music Advisory Board',
  meta: [
    { 
      name: 'description', 
      content: 'Explore Houston\'s music venues, recording studios, and historic landmarks on our interactive map.' 
    }
  ]
})

const selectedType = ref<string | null>(null)

const filteredVenues = computed(() => {
  if (!selectedType.value) return venues
  return venues.filter(v => v.type === selectedType.value)
})
</script>

<template>
  <div>
    <!-- Hero Section -->
    <HeroSection 
      title="Houston Music Map"
      subtitle="Discover venues, studios, and landmarks across the Bayou City"
    />

    <!-- Map Section -->
    <section class="py-24 bg-space-dark">
      <div class="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <SectionHeading 
          title="EXPLORE HOUSTON'S MUSIC SCENE" 
          subtitle="Interactive map of venues, recording studios, and historic landmarks"
          centered 
        />

        <!-- Google Map Component -->
        <div class="mb-12 rounded-2xl overflow-hidden border border-white/10">
          <GoogleMap />
        </div>
      </div>
    </section>

    <!-- Venue Directory -->
    <section class="py-24 bg-space-black">
      <div class="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <SectionHeading 
          title="VENUE DIRECTORY" 
          centered 
        />

        <!-- Filter Buttons -->
        <div class="flex flex-wrap justify-center gap-3 mb-12">
          <button
            @click="selectedType = null"
            :class="[
              'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
              !selectedType 
                ? 'bg-electric-blue text-space-black' 
                : 'bg-space-gray text-text-secondary hover:bg-space-gray-light border border-white/10'
            ]"
          >
            All Locations
          </button>
          <button
            v-for="(info, type) in venueTypes"
            :key="type"
            @click="selectedType = type"
            :class="[
              'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center',
              selectedType === type 
                ? 'text-white' 
                : 'bg-space-gray text-text-secondary hover:bg-space-gray-light border border-white/10'
            ]"
            :style="selectedType === type ? { backgroundColor: info.color } : {}"
          >
            <span 
              class="w-3 h-3 rounded-full mr-2"
              :style="{ backgroundColor: info.color }"
            />
            {{ info.label }}
          </button>
        </div>

        <!-- Venue Cards Grid -->
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <article 
            v-for="venue in filteredVenues" 
            :key="venue.id"
            class="bg-space-gray rounded-2xl border border-white/10 overflow-hidden hover:border-electric-blue/50 transition-all duration-300"
          >
            <div class="p-6">
              <div class="flex items-start justify-between mb-3">
                <h3 class="font-display font-semibold text-lg text-white">
                  {{ venue.name }}
                </h3>
                <span 
                  class="px-2 py-1 text-xs font-medium rounded-full text-white flex-shrink-0 ml-2"
                  :style="{ backgroundColor: venueTypes[venue.type]?.color }"
                >
                  {{ venueTypes[venue.type]?.label }}
                </span>
              </div>
              
              <p class="text-text-secondary text-sm mb-4">
                {{ venue.description }}
              </p>

              <div class="flex items-start text-sm text-text-muted mb-4">
                <svg class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span>{{ venue.address }}</span>
              </div>

              <a 
                v-if="venue.website"
                :href="venue.website"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center text-electric-blue text-sm font-medium hover:text-white transition-colors"
              >
                Visit Website
                <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
              </a>
            </div>
          </article>
        </div>

        <!-- Empty State -->
        <div 
          v-if="filteredVenues.length === 0" 
          class="text-center py-12"
        >
          <svg class="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          </svg>
          <p class="text-text-muted">No venues found for this category.</p>
          <button 
            @click="selectedType = null"
            class="mt-4 text-electric-blue font-medium hover:text-white transition-colors"
          >
            View all locations
          </button>
        </div>
      </div>
    </section>

    <!-- Add Your Venue -->
    <section class="py-24 bg-space-dark border-t border-white/10">
      <div class="max-w-4xl mx-auto px-6 md:px-8 lg:px-12 text-center">
        <h2 class="font-display text-4xl font-bold text-white mb-6 tracking-tight">
          Add Your Venue or Studio
        </h2>
        <p class="text-text-secondary text-xl mb-12">
          Have a music venue, recording studio, or music business in Houston? Register in our Music Directory to be featured on the map.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="https://houston.reel-scout.com/crew_registration.aspx?cl=M&type=B&g=MOCA"
            target="_blank"
            rel="noopener noreferrer"
            class="px-8 py-4 bg-gold-accent text-space-black font-bold rounded-full hover:bg-white transition-all duration-300 hover:scale-105"
          >
            Register Your Business
          </a>
          <NuxtLink 
            to="/contact"
            class="px-8 py-4 bg-white/10 backdrop-blur text-white font-bold rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300"
          >
            Contact Us
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
