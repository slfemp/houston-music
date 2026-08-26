<script setup lang="ts">
/**
 * Month-grid calendar over a mixed feed of meetings, events, and volunteer
 * shifts. Kind is carried by a coloured dot beside the title rather than by
 * colouring the text - a hue light enough to read as a chip is not legible as
 * text on this surface, and the legend has to work for colour-blind readers.
 */
const props = withDefaults(defineProps<{
  entries: Array<{
    id: string, kind: string, title: string, startsAt: string, endsAt?: string | null,
    location?: string | null, url?: string | null, visibility?: string, category?: string | null,
  }>
  /** Board view marks internal items; the public view never receives them. */
  showVisibility?: boolean
}>(), { showVisibility: false })

const KIND = {
  meeting: { label: 'Board meeting', color: 'var(--color-viz-1)' },
  event: { label: 'Event', color: 'var(--color-viz-3)' },
  volunteer: { label: 'Volunteer shift', color: 'var(--color-viz-2)' },
} as const

const cursor = ref(new Date())
cursor.value.setDate(1)

const monthLabel = computed(() =>
  cursor.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }))

function shift(months: number) {
  const d = new Date(cursor.value)
  d.setMonth(d.getMonth() + months)
  d.setDate(1)
  cursor.value = d
}
function today() {
  const d = new Date()
  d.setDate(1)
  cursor.value = d
}

/** Local-midnight key, so an entry never lands on the wrong day via UTC drift. */
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`

const byDay = computed(() => {
  const map = new Map<string, typeof props.entries>()
  for (const e of props.entries) {
    const k = dayKey(new Date(e.startsAt))
    if (!map.has(k)) map.set(k, [])
    map.get(k)!.push(e)
  }
  return map
})

/** Six weeks always, so the grid height does not jump between months. */
const weeks = computed(() => {
  const first = new Date(cursor.value)
  const start = new Date(first)
  start.setDate(1 - first.getDay())

  const out: Array<Array<{ date: Date, inMonth: boolean, isToday: boolean, items: typeof props.entries }>> = []
  const now = new Date()
  for (let w = 0; w < 6; w++) {
    const row = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(start)
      date.setDate(start.getDate() + w * 7 + d)
      row.push({
        date,
        inMonth: date.getMonth() === first.getMonth(),
        isToday: dayKey(date) === dayKey(now),
        items: byDay.value.get(dayKey(date)) ?? [],
      })
    }
    out.push(row)
  }
  return out
})

const selected = ref<Date | null>(null)
const selectedItems = computed(() =>
  selected.value ? (byDay.value.get(dayKey(selected.value)) ?? []) : [])

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const time = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago' })
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <h3 class="font-display text-xl font-semibold">{{ monthLabel }}</h3>
      <div class="flex items-center gap-1">
        <button class="px-3 py-1.5 rounded-lg border border-white/10 text-sm text-text-secondary hover:text-white hover:border-white/30 transition-colors" aria-label="Previous month" @click="shift(-1)">←</button>
        <button class="px-3 py-1.5 rounded-lg border border-white/10 text-sm text-text-secondary hover:text-white hover:border-white/30 transition-colors" @click="today">Today</button>
        <button class="px-3 py-1.5 rounded-lg border border-white/10 text-sm text-text-secondary hover:text-white hover:border-white/30 transition-colors" aria-label="Next month" @click="shift(1)">→</button>
      </div>
    </div>

    <!-- Legend: identity never rests on colour alone -->
    <ul class="flex flex-wrap gap-x-4 gap-y-1.5 mb-4">
      <li v-for="(k, key) in KIND" :key="key" class="flex items-center gap-2 text-xs text-text-secondary">
        <span class="block w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: k.color }" />
        {{ k.label }}
      </li>
    </ul>

    <div class="grid grid-cols-7 gap-px bg-white/5 rounded-xl overflow-hidden border border-white/10">
      <div v-for="d in DOW" :key="d" class="bg-space-dark px-2 py-2 text-center text-[11px] uppercase tracking-wide text-text-muted">
        <span class="hidden sm:inline">{{ d }}</span><span class="sm:hidden">{{ d[0] }}</span>
      </div>

      <template v-for="(week, wi) in weeks" :key="wi">
        <button
          v-for="cell in week" :key="cell.date.toISOString()"
          class="bg-space-gray min-h-[76px] sm:min-h-[92px] p-1.5 text-left align-top transition-colors hover:bg-white/5 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-electric-blue focus-visible:ring-inset"
          :class="cell.inMonth ? '' : 'opacity-35'"
          @click="selected = cell.date"
        >
          <span
            class="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs mb-1"
            :class="cell.isToday ? 'bg-electric-blue text-space-black font-bold' : 'text-text-secondary'"
          >{{ cell.date.getDate() }}</span>

          <span
            v-for="item in cell.items.slice(0, 2)" :key="item.id"
            class="flex items-start gap-1 mb-0.5"
          >
            <span
              class="block w-1.5 h-1.5 rounded-full mt-1 shrink-0"
              :style="{ backgroundColor: (KIND as any)[item.kind]?.color ?? 'var(--color-viz-1)' }"
            />
            <span class="text-[10px] leading-tight text-text-secondary line-clamp-2">{{ item.title }}</span>
          </span>
          <span v-if="cell.items.length > 2" class="block text-[10px] text-text-muted pl-2.5">
            +{{ cell.items.length - 2 }} more
          </span>
        </button>
      </template>
    </div>

    <!-- Day detail: the value a small cell cannot hold -->
    <div v-if="selected" class="mt-5 bg-space-dark rounded-xl border border-white/10 p-5">
      <div class="flex items-start justify-between gap-3 mb-3">
        <h4 class="font-semibold">
          {{ selected.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) }}
        </h4>
        <button class="text-text-muted hover:text-white transition-colors text-sm" aria-label="Close" @click="selected = null">✕</button>
      </div>

      <ul v-if="selectedItems.length" class="space-y-3">
        <li v-for="item in selectedItems" :key="item.id" class="flex gap-3">
          <span
            class="block w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
            :style="{ backgroundColor: (KIND as any)[item.kind]?.color ?? 'var(--color-viz-1)' }"
          />
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-medium text-sm">{{ item.title }}</span>
              <span
                v-if="showVisibility && item.visibility === 'board'"
                class="px-2 py-0.5 rounded text-[10px] bg-gold-accent/15 text-gold-accent"
              >Board only</span>
            </div>
            <p class="text-xs text-text-secondary mt-0.5">
              {{ time(item.startsAt) }}<template v-if="item.location"> · {{ item.location }}</template>
            </p>
            <NuxtLink
              v-if="item.url && item.url.startsWith('/')" :to="item.url"
              class="text-xs text-electric-blue hover:text-white transition-colors"
            >Open →</NuxtLink>
            <a
              v-else-if="item.url" :href="item.url" target="_blank" rel="noopener"
              class="text-xs text-electric-blue hover:text-white transition-colors"
            >Details →</a>
          </div>
        </li>
      </ul>
      <p v-else class="text-sm text-text-muted">Nothing scheduled.</p>
    </div>
  </div>
</template>
