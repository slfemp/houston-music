<script setup lang="ts">
/**
 * A single ratio against a limit. The unfilled track is a lighter step of the
 * same ramp rather than plain gray, so the state reads across the whole bar
 * instead of only where the fill stops.
 */
const props = defineProps<{
  label: string
  value: number
  limit: number
  format: (v: number) => string
  /** Over-limit is a state, not a series - it gets the status hue. */
  over?: boolean
}>()

const pct = computed(() => props.limit > 0 ? Math.min(100, Math.round((props.value / props.limit) * 100)) : 0)
const rawPct = computed(() => props.limit > 0 ? Math.round((props.value / props.limit) * 100) : 0)
</script>

<template>
  <div>
    <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 mb-1.5">
      <span class="text-sm capitalize">{{ label }}</span>
      <span class="text-xs text-text-secondary tabular-nums">
        <span class="text-text-primary font-medium">{{ format(value) }}</span>
        of {{ format(limit) }}
        <span :class="over ? 'text-neon-pink' : 'text-text-muted'">· {{ rawPct }}%</span>
      </span>
    </div>
    <div
      class="h-2 rounded-full overflow-hidden"
      style="background-color: var(--color-viz-track)"
      role="meter" :aria-valuenow="rawPct" aria-valuemin="0" :aria-valuemax="100"
      :aria-label="`${label}: ${rawPct} percent of budget used`"
    >
      <div
        class="h-full rounded-full transition-all duration-500"
        :style="{ width: `${pct}%`, backgroundColor: over ? 'var(--color-viz-4)' : 'var(--color-viz-1)' }"
      />
    </div>
  </div>
</template>
