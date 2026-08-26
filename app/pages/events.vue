<script setup lang="ts">
useHead({
  title: 'Events — Houston Music Advisory Board',
  meta: [{ name: 'description', content: 'Upcoming events from the Houston Music Advisory Board: showcases, workshops, listening sessions, and public meetings.' }],
})

const { data: events } = await useFetch('/api/public/events', { default: () => [] })
const { data: meetings } = await useFetch('/api/public/meetings', { default: () => ({ upcoming: [], past: [] }) })
const { data: calendar } = await useFetch('/api/public/calendar', { default: () => [] })

const view = ref<'list' | 'calendar'>('list')

const categoryColor: Record<string, string> = {
  showcase: 'bg-neon-pink/15 text-neon-pink border-neon-pink/30',
  workshop: 'bg-electric-purple/15 text-electric-purple border-electric-purple/30',
  community: 'bg-electric-blue/15 text-electric-blue border-electric-blue/30',
  conference: 'bg-gold-accent/15 text-gold-accent border-gold-accent/30',
  fundraiser: 'bg-gold-accent/15 text-gold-accent border-gold-accent/30',
  deadline: 'bg-neon-pink/15 text-neon-pink border-neon-pink/30',
  civic: 'bg-white/5 text-text-secondary border-white/15',
  other: 'bg-white/5 text-text-secondary border-white/15',
}

function fmt(v: string, opts: Intl.DateTimeFormatOptions = {}) {
  return new Date(v).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago', ...opts,
  })
}
</script>

<template>
  <div>
    <section class="relative py-20 md:py-28 overflow-hidden">
      <div class="absolute inset-0 bg-linear-to-b from-electric-blue/10 to-transparent" />
      <div class="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h1 class="font-display text-4xl md:text-6xl font-black mb-6">
          <span class="text-gradient">Events</span> &amp; Meetings
        </h1>
        <p class="text-lg text-text-secondary max-w-2xl mx-auto mb-8">
          Showcases, workshops, listening sessions, and the board's public meetings.
        </p>
        <div class="inline-flex rounded-full border border-white/15 p-1">
          <button
            v-for="v in (['list', 'calendar'] as const)" :key="v"
            class="px-5 py-2 rounded-full text-sm capitalize transition-colors"
            :class="view === v ? 'bg-electric-blue text-space-black font-semibold' : 'text-text-secondary hover:text-white'"
            @click="view = v"
          >{{ v }}</button>
        </div>
      </div>
    </section>

    <!-- Calendar view -->
    <section v-if="view === 'calendar'" class="pb-24">
      <div class="max-w-5xl mx-auto px-4 sm:px-6">
        <div class="bg-space-gray rounded-2xl border border-white/10 p-5 sm:p-6">
          <EventCalendar :entries="calendar as any[]" />
        </div>
        <div class="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
          <a href="/calendar.ics" class="px-5 py-2.5 rounded-full border border-white/15 hover:border-electric-blue hover:text-electric-blue transition-colors">
            Subscribe in your calendar
          </a>
          <span class="text-text-muted text-xs">Works with Google Calendar, Apple Calendar, and Outlook</span>
        </div>
      </div>
    </section>

    <section v-if="view === 'list' && (events as any[]).length" class="pb-16">
      <div class="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 class="font-display text-2xl font-bold mb-6">Upcoming Events</h2>
        <div class="grid gap-6 md:grid-cols-2">
          <article v-for="e in (events as any[])" :key="e.id" class="bg-space-gray rounded-2xl border border-white/10 overflow-hidden flex flex-col hover:border-electric-blue/40 transition-colors">
            <div v-if="e.imageUrl" class="aspect-video bg-space-dark overflow-hidden">
              <img :src="e.imageUrl" :alt="e.title" class="w-full h-full object-cover">
            </div>
            <div class="p-6 flex-1 flex flex-col">
              <span class="self-start px-3 py-1 rounded-full text-xs border mb-3 capitalize" :class="categoryColor[e.category] ?? categoryColor.other">{{ e.category }}</span>
              <h3 class="font-display text-xl font-semibold mb-2">{{ e.title }}</h3>
              <p class="text-sm text-electric-blue mb-1">{{ fmt(e.startsAt) }}</p>
              <p v-if="e.location" class="text-sm text-text-muted mb-3">{{ e.location }}</p>
              <p class="text-text-secondary text-sm leading-relaxed flex-1">{{ e.description }}</p>
              <div class="flex flex-wrap gap-3 mt-5">
                <a v-if="e.externalRsvpUrl" :href="e.externalRsvpUrl" target="_blank" rel="noopener"
                  class="px-5 py-2.5 rounded-full bg-electric-blue text-space-black font-bold text-sm hover:bg-white transition-colors">RSVP</a>
                <a v-if="e.virtualUrl" :href="e.virtualUrl" target="_blank" rel="noopener"
                  class="px-5 py-2.5 rounded-full border border-white/15 text-sm hover:border-electric-blue hover:text-electric-blue transition-colors">Join online</a>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section v-if="view === 'list'" class="pb-24">
      <div class="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 class="font-display text-2xl font-bold mb-2">Public Meetings</h2>
        <p class="text-text-secondary text-sm mb-6">Agendas are posted in advance. Meetings are open to the public.</p>

        <div v-if="meetings.upcoming.length" class="space-y-4">
          <article v-for="m in meetings.upcoming" :key="m.id" class="bg-space-gray rounded-2xl border border-white/10 p-6">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 class="font-display text-xl font-semibold">{{ m.title }}</h3>
                <p class="text-sm text-electric-blue mt-1">{{ fmt(m.startsAt) }}</p>
                <p class="text-sm text-text-muted">{{ m.location }}</p>
              </div>
              <a v-if="m.virtualUrl" :href="m.virtualUrl" target="_blank" rel="noopener"
                class="px-4 py-2 rounded-full border border-white/15 text-sm hover:border-electric-blue hover:text-electric-blue transition-colors">Join online</a>
            </div>

            <details v-if="m.agenda?.length" class="mt-4">
              <summary class="text-sm text-electric-blue cursor-pointer hover:text-white transition-colors">View agenda ({{ m.agenda.length }} items)</summary>
              <ol class="mt-3 space-y-2">
                <li v-for="item in m.agenda" :key="item.itemNumber" class="flex gap-3 text-sm">
                  <span class="font-mono text-electric-blue shrink-0 w-8">{{ item.itemNumber }}.</span>
                  <div>
                    <span>{{ item.title }}</span>
                    <p v-if="item.description" class="text-xs text-text-muted mt-0.5">{{ item.description }}</p>
                  </div>
                </li>
              </ol>
            </details>
          </article>
        </div>
        <p v-else class="py-10 text-center text-text-muted bg-space-gray rounded-2xl border border-white/10">No meetings currently noticed.</p>

        <div v-if="meetings.past.length" class="mt-10">
          <h3 class="font-display text-lg font-semibold mb-4">Past Meetings &amp; Minutes</h3>
          <ul class="space-y-2">
            <li v-for="m in meetings.past" :key="m.id" class="bg-space-gray rounded-xl border border-white/10 p-4">
              <details>
                <summary class="cursor-pointer text-sm flex flex-wrap items-center gap-2">
                  <span class="font-medium">{{ m.title }}</span>
                  <span class="text-text-muted">— {{ fmt(m.startsAt, { hour: undefined, minute: undefined }) }}</span>
                  <span class="px-2 py-0.5 rounded text-[11px] bg-electric-blue/15 text-electric-blue">Minutes adopted</span>
                </summary>
                <div v-if="m.minutes" class="mt-3 text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">{{ m.minutes }}</div>
              </details>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>
