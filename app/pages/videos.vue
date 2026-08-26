<script setup lang="ts">
import { videos } from '~/data/videos'

useHead({
  title: 'Videos - Houston Music Advisory Board',
  meta: [
    {
      name: 'description',
      content: 'Watch recordings from Houston Music Advisory Board listening sessions, workshops, and community events.'
    }
  ]
})

const shown = computed(() => videos.filter((v) => v.id))
const byYear = computed(() => {
  const groups = new Map<number, typeof videos>()
  for (const v of shown.value) {
    if (!groups.has(v.year)) groups.set(v.year, [])
    groups.get(v.year)!.push(v)
  }
  return [...groups.entries()].sort((a, b) => b[0] - a[0])
})
</script>

<template>
  <div>
    <HeroSection
      title="Videos"
      subtitle="Recordings from our listening sessions, workshops, and community events"
    />

    <section class="py-24 bg-space-dark">
      <div class="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <div v-for="[year, vids] in byYear" :key="year" class="mb-16 last:mb-0">
          <SectionHeading :title="String(year)" />
          <div class="grid gap-8" :class="vids.length > 1 ? 'md:grid-cols-2' : 'max-w-3xl mx-auto'">
            <VideoEmbed
              v-for="v in vids" :key="v.id"
              :src="`https://www.youtube.com/embed/${v.id}`"
              :title="v.title"
              :caption="v.caption"
              :caption-link="v.captionLink"
            />
          </div>
        </div>

        <div class="mt-16 text-center bg-space-gray rounded-2xl border border-white/10 p-10">
          <h3 class="font-display text-2xl font-bold text-white mb-3">More recordings on the way</h3>
          <p class="text-text-secondary max-w-2xl mx-auto">
            We're digitizing recordings from past listening sessions, forums, and preservation events —
            including the Sound Diplomacy Music City Forum and Houston's Hip Hop 50th Anniversary.
            Check back, or <NuxtLink to="/contact" class="text-electric-blue hover:text-white transition-colors">reach out</NuxtLink>
            if you recorded one of our events.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
