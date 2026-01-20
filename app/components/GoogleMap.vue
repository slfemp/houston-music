<script setup lang="ts">
import { Loader } from '@googlemaps/js-api-loader'
import { venues, venueTypes } from '~/data/venues'

const mapDiv = ref<HTMLElement | null>(null)
const config = useRuntimeConfig()
const mapLoaded = ref(false)
const mapError = ref<string | null>(null)

onMounted(async () => {
  if (!config.public.googleMapsApiKey) {
    mapError.value = 'Google Maps API key not configured'
    return
  }

  try {
    const loader = new Loader({
      apiKey: config.public.googleMapsApiKey,
      version: 'weekly'
    })

    const { Map } = await loader.importLibrary('maps')
    const { AdvancedMarkerElement } = await loader.importLibrary('marker')

    if (!mapDiv.value) return

    const map = new Map(mapDiv.value, {
      center: { lat: 29.7604, lng: -95.3698 }, // Houston center
      zoom: 11,
      mapId: 'houston-music-map',
      styles: [
        {
          featureType: 'poi',
          stylers: [{ visibility: 'simplified' }]
        }
      ]
    })

    // Add markers for each venue
    venues.forEach(venue => {
      const markerColor = venueTypes[venue.type]?.color || '#1e3a8a'
      
      // Create custom marker element
      const markerEl = document.createElement('div')
      markerEl.className = 'custom-marker'
      markerEl.style.cssText = `
        width: 32px;
        height: 32px;
        background-color: ${markerColor};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      `
      
      // Add icon inside
      markerEl.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
      `

      const marker = new AdvancedMarkerElement({
        map,
        position: { lat: venue.lat, lng: venue.lng },
        title: venue.name,
        content: markerEl
      })

      // Create info window content
      const infoContent = `
        <div style="max-width: 250px; padding: 8px;">
          <h3 style="margin: 0 0 8px 0; font-weight: 600; font-size: 16px; color: #1e3a8a;">
            ${venue.name}
          </h3>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #4b5563;">
            ${venue.description}
          </p>
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280;">
            <strong>Address:</strong> ${venue.address}
          </p>
          <span style="
            display: inline-block;
            padding: 2px 8px;
            font-size: 12px;
            border-radius: 9999px;
            background-color: ${markerColor}20;
            color: ${markerColor};
          ">
            ${venueTypes[venue.type]?.label || venue.type}
          </span>
          ${venue.website ? `
            <a href="${venue.website}" target="_blank" rel="noopener noreferrer" 
               style="display: block; margin-top: 8px; color: #1e3a8a; font-size: 13px; text-decoration: none;">
              Visit Website →
            </a>
          ` : ''}
        </div>
      `

      const { InfoWindow } = google.maps
      const infoWindow = new InfoWindow({
        content: infoContent
      })

      marker.addListener('click', () => {
        infoWindow.open(map, marker)
      })
    })

    mapLoaded.value = true
  } catch (error) {
    console.error('Error loading Google Maps:', error)
    mapError.value = 'Failed to load map. Please try again later.'
  }
})
</script>

<template>
  <div class="relative">
    <!-- Map container -->
    <div 
      ref="mapDiv" 
      class="w-full h-[500px] rounded-lg shadow-md bg-gray-200"
      :class="{ 'animate-pulse': !mapLoaded && !mapError }"
    />

    <!-- Loading state -->
    <div 
      v-if="!mapLoaded && !mapError" 
      class="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg"
    >
      <div class="text-center">
        <svg class="w-12 h-12 text-gray-400 mx-auto animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
        <p class="mt-2 text-gray-500">Loading map...</p>
      </div>
    </div>

    <!-- Error state -->
    <div 
      v-if="mapError" 
      class="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg"
    >
      <div class="text-center px-4">
        <svg class="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
        </svg>
        <p class="mt-2 text-gray-600">{{ mapError }}</p>
        <p class="mt-1 text-sm text-gray-500">Please configure the Google Maps API key.</p>
      </div>
    </div>

    <!-- Legend -->
    <div class="mt-4 flex flex-wrap gap-4 justify-center">
      <div 
        v-for="(info, type) in venueTypes" 
        :key="type"
        class="flex items-center space-x-2"
      >
        <div 
          class="w-4 h-4 rounded-full border-2 border-white shadow"
          :style="{ backgroundColor: info.color }"
        />
        <span class="text-sm text-gray-600">{{ info.label }}</span>
      </div>
    </div>
  </div>
</template>
