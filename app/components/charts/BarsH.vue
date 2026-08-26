<script setup lang="ts">
/**
 * Horizontal bars for magnitude comparison across named categories.
 *
 * Nominal categories all wear the SAME hue: bar length already encodes the
 * value, so spending the identity channel to re-encode it would be redundant
 * and would imply eight unrelated series where there is one.
 */
const props = withDefaults(defineProps<{
  data: Array<{ label: string, value: number, meta?: string }>
  /** Formats the value for labels, tooltip, and table. */
  format?: (v: number) => string
  color?: string
  /** Bars are capped, never stretched to fill their band. */
  barThickness?: number
}>(), {
  format: (v: number) => String(v),
  color: 'var(--color-viz-1)',
  barThickness: 18,
})

const ROW = 34
const LABEL_W = 132
const PAD_R = 76

const max = computed(() => Math.max(1, ...props.data.map(d => d.value)))
const height = computed(() => props.data.length * ROW)

const hovered = ref<number | null>(null)

function barWidth(v: number, plotW: number) {
  return Math.max(2, (v / max.value) * plotW)
}
</script>

<template>
  <div class="relative">
    <svg
      :viewBox="`0 0 640 ${height}`" :height="height"
      class="w-full overflow-visible" role="img"
      :aria-label="`Bar chart: ${data.length} categories`"
    >
      <g v-for="(d, i) in data" :key="d.label" :transform="`translate(0 ${i * ROW})`">
        <!-- Hit target spans the full row, not just the painted bar -->
        <rect
          :y="0" x="0" width="640" :height="ROW" fill="transparent"
          class="cursor-default"
          @pointerenter="hovered = i" @pointerleave="hovered = null"
          @focus="hovered = i" @blur="hovered = null" tabindex="0"
        />
        <text
          :x="LABEL_W - 10" :y="ROW / 2" text-anchor="end" dominant-baseline="middle"
          class="fill-text-secondary text-[12px]"
        >{{ d.label }}</text>

        <!-- Track reads as the unfilled remainder, one step off the surface -->
        <rect
          :x="LABEL_W" :y="(ROW - barThickness) / 2" :width="640 - LABEL_W - PAD_R" :height="barThickness"
          rx="3" fill="var(--color-viz-track)"
        />
        <!-- 4px rounded data-end, square at the baseline -->
        <path
          :d="(() => {
            const w = barWidth(d.value, 640 - LABEL_W - PAD_R)
            const y = (ROW - barThickness) / 2
            const r = Math.min(4, w)
            return `M${LABEL_W},${y} h${w - r} a${r},${r} 0 0 1 ${r},${r} v${barThickness - 2 * r} a${r},${r} 0 0 1 ${-r},${r} h${-(w - r)} z`
          })()"
          :fill="color"
          :opacity="hovered === null || hovered === i ? 1 : 0.45"
          class="transition-opacity duration-150"
        />
        <text
          :x="LABEL_W + barWidth(d.value, 640 - LABEL_W - PAD_R) + 8" :y="ROW / 2"
          dominant-baseline="middle" class="fill-text-primary text-[12px] tabular-nums"
        >{{ format(d.value) }}</text>
      </g>
    </svg>

    <div
      v-if="hovered !== null && data[hovered]?.meta"
      class="absolute left-0 -top-1 px-3 py-2 rounded-lg bg-space-black border border-white/15 shadow-xl pointer-events-none text-xs z-10"
    >
      <div class="font-semibold text-white">{{ format(data[hovered].value) }}</div>
      <div class="text-text-secondary">{{ data[hovered].meta }}</div>
    </div>
  </div>
</template>
