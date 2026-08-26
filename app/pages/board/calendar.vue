<script setup lang="ts">
definePageMeta({ layout: 'board', middleware: 'board' })
useHead({ title: 'Calendar' })

const { data: entries } = await useFetch('/api/calendar', { default: () => [] })

const upcoming = computed(() =>
  (entries.value as any[])
    .filter(e => new Date(e.startsAt).getTime() >= Date.now())
    .slice(0, 8))

const time = (iso: string) => new Date(iso).toLocaleString('en-US', {
  weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  timeZone: 'America/Chicago',
})
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="font-display text-3xl font-bold">Calendar</h1>
      <p class="text-text-secondary text-sm mt-1">
        Meetings, events, and volunteer shifts together. Board-only items are marked and never appear publicly.
      </p>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <div class="lg:col-span-2 bg-space-gray rounded-2xl border border-white/10 p-5 sm:p-6">
        <EventCalendar :entries="entries as any[]" show-visibility />
      </div>

      <aside class="bg-space-gray rounded-2xl border border-white/10 p-6 h-fit">
        <h2 class="font-display text-lg font-semibold mb-4">Coming up</h2>
        <ul v-if="upcoming.length" class="space-y-4">
          <li v-for="e in upcoming" :key="`${e.kind}-${e.id}`" class="flex gap-3">
            <span
              class="block w-2 h-2 rounded-full mt-1.5 shrink-0"
              :style="{ backgroundColor: e.kind === 'meeting' ? 'var(--color-viz-1)' : e.kind === 'event' ? 'var(--color-viz-3)' : 'var(--color-viz-2)' }"
            />
            <div class="min-w-0">
              <NuxtLink v-if="e.url?.startsWith('/')" :to="e.url" class="text-sm font-medium hover:text-electric-blue transition-colors">{{ e.title }}</NuxtLink>
              <span v-else class="text-sm font-medium">{{ e.title }}</span>
              <p class="text-xs text-text-muted mt-0.5">{{ time(e.startsAt) }}</p>
              <span v-if="e.visibility === 'board'" class="inline-block mt-1 px-2 py-0.5 rounded text-[10px] bg-gold-accent/15 text-gold-accent">Board only</span>
            </div>
          </li>
        </ul>
        <p v-else class="text-sm text-text-muted">Nothing scheduled.</p>

        <a href="/calendar.ics" class="block mt-6 pt-4 border-t border-white/5 text-xs text-electric-blue hover:text-white transition-colors">
          Public .ics feed →
        </a>
      </aside>
    </div>
  </div>
</template>
