<script setup lang="ts">
definePageMeta({ layout: 'board', middleware: 'board' })
useHead({ title: 'HMAB Admin — Map' })

import { setOptions, importLibrary } from '@googlemaps/js-api-loader'

interface GNode { id: string; type: string; name: string; data: Record<string, any> }
const { data: graph } = await useFetch<{ nodes: GNode[] }>('/api/admin/graph')

const config = useRuntimeConfig()
const mapDiv = ref<HTMLElement | null>(null)
const mapError = ref('')
const plotted = ref(0)
const pending = ref(0)

const AREA_FALLBACKS: Record<string, string> = {} // future: area centroids

onMounted(async () => {
  if (!config.public.googleMapsApiKey) {
    mapError.value = 'Google Maps API key not configured (GOOGLE_MAPS_API_KEY).'
    return
  }
  const venues = (graph.value?.nodes || []).filter((n) => n.type === 'venue')
  try {
    setOptions({ key: config.public.googleMapsApiKey, v: 'weekly' })
    const { Map, InfoWindow } = await importLibrary('maps')
    const { AdvancedMarkerElement } = await importLibrary('marker')
    const { Geocoder } = await importLibrary('geocoding')
    if (!mapDiv.value) return

    const map = new Map(mapDiv.value, {
      center: { lat: 29.7604, lng: -95.3698 },
      zoom: 11,
      mapId: 'hmab-admin-map',
    })
    const geocoder = new Geocoder()
    const info = new InfoWindow()

    // Geocode results cache in localStorage so we don't re-hit the API.
    let cache: Record<string, { lat: number; lng: number }> = {}
    try { cache = JSON.parse(localStorage.getItem('hmab-geocode') || '{}') } catch {}

    async function locate(v: GNode): Promise<{ lat: number; lng: number } | null> {
      // Coordinates already on the node (e.g. from the OSM sweep) win — no geocode needed.
      if (typeof v.data.lat === 'number' && typeof v.data.lng === 'number') {
        return { lat: v.data.lat, lng: v.data.lng }
      }
      const address = v.data.address || AREA_FALLBACKS[v.data.area]
      if (!address) return null
      if (cache[address]) return cache[address]
      try {
        const res = await geocoder.geocode({ address })
        const loc = res.results?.[0]?.geometry?.location
        if (!loc) return null
        const pos = { lat: loc.lat(), lng: loc.lng() }
        cache[address] = pos
        try { localStorage.setItem('hmab-geocode', JSON.stringify(cache)) } catch {}
        return pos
      } catch { return null }
    }

    pending.value = venues.length
    for (const v of venues) {
      const pos = await locate(v)
      pending.value--
      if (!pos) continue
      const el = document.createElement('div')
      el.style.cssText = 'width:28px;height:28px;background:#FFB700;border:3px solid #000;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.5);cursor:pointer;display:flex;align-items:center;justify-content:center'
      el.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="black"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>'
      const marker = new AdvancedMarkerElement({ map, position: pos, title: v.name, content: el })
      marker.addListener('click', () => {
        info.setContent(`<div style="max-width:260px;padding:6px;color:#111">
          <strong>${v.name}</strong>
          <p style="margin:6px 0;font-size:13px">${v.data.description || ''}</p>
          ${v.data.hmabUse ? `<p style="margin:0;font-size:12px;color:#555"><b>HMAB:</b> ${v.data.hmabUse}</p>` : ''}
        </div>`)
        info.open({ map, anchor: marker })
      })
      plotted.value++
    }
  } catch (e: any) {
    mapError.value = e?.message || 'Map failed to load.'
  }
})
</script>

<template>
  <div class="h-[calc(100vh-9rem)] flex flex-col">
    <div class="px-6 py-4 border-b border-white/10 flex items-center gap-4">
      <h1 class="text-xl font-bold">Venue Map</h1>
      <span class="text-xs text-text-muted">{{ plotted }} plotted<span v-if="pending"> · {{ pending }} geocoding…</span></span>
      <span v-if="mapError" class="text-xs text-neon-pink">{{ mapError }}</span>
    </div>
    <div ref="mapDiv" class="flex-1" />
  </div>
</template>
