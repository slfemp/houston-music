<script setup lang="ts">
/**
 * Two series over time as grouped columns.
 *
 * Both series share ONE y-axis. A second axis would let two different scales
 * imply a relationship the data does not contain - here both series are dollars,
 * so a single scale is honest and comparison is direct.
 */
const props = withDefaults(defineProps<{
  data: Array<{ label: string, a: number, b: number }>
  seriesA: string
  seriesB: string
  format?: (v: number) => string
  colorA?: string
  colorB?: string
}>(), {
  format: (v: number) => String(v),
  colorA: 'var(--color-viz-1)',
  colorB: 'var(--color-viz-4)',
})

const W = 720
const H = 260
const PAD = { top: 16, right: 12, bottom: 30, left: 56 }
const plotW = W - PAD.left - PAD.right
const plotH = H - PAD.top - PAD.bottom

const max = computed(() => Math.max(1, ...props.data.flatMap(d => [d.a, d.b])))

/** Round the axis top to a clean number so ticks read 0 / 10,000 / 20,000. */
const axisTop = computed(() => {
  const m = max.value
  const mag = 10 ** Math.floor(Math.log10(m))
  return Math.ceil(m / mag) * mag
})
const ticks = computed(() => [0, 0.25, 0.5, 0.75, 1].map(f => f * axisTop.value))

const band = computed(() => plotW / Math.max(1, props.data.length))
// Cap thickness and leave the band's remainder as air, with a 2px gap between pairs.
const barW = computed(() => Math.min(22, (band.value - 10) / 2 - 1))

const hovered = ref<number | null>(null)
const y = (v: number) => PAD.top + plotH - (v / axisTop.value) * plotH

function roundedTop(x: number, v: number, w: number) {
  const top = y(v)
  const h = Math.max(0, PAD.top + plotH - top)
  const r = Math.min(4, w / 2, h)
  if (h <= 0.5) return ''
  return `M${x},${PAD.top + plotH} v${-(h - r)} a${r},${r} 0 0 1 ${r},${-r} h${w - 2 * r} a${r},${r} 0 0 1 ${r},${r} v${h - r} z`
}
</script>

<template>
  <div class="relative">
    <svg :viewBox="`0 0 ${W} ${H}`" class="w-full" role="img" :aria-label="`Grouped columns: ${seriesA} and ${seriesB}`">
      <!-- Recessive hairline gridlines, solid never dashed -->
      <g>
        <line
          v-for="t in ticks" :key="`g${t}`"
          :x1="PAD.left" :x2="W - PAD.right" :y1="y(t)" :y2="y(t)"
          stroke="var(--color-viz-grid)" stroke-width="1"
        />
        <text
          v-for="t in ticks" :key="`t${t}`"
          :x="PAD.left - 8" :y="y(t)" text-anchor="end" dominant-baseline="middle"
          class="fill-text-muted text-[11px] tabular-nums"
        >{{ format(t) }}</text>
      </g>

      <g v-for="(d, i) in data" :key="d.label">
        <rect
          :x="PAD.left + i * band" :y="PAD.top" :width="band" :height="plotH" fill="transparent"
          tabindex="0" @pointerenter="hovered = i" @pointerleave="hovered = null"
          @focus="hovered = i" @blur="hovered = null"
        />
        <rect
          v-if="hovered === i" :x="PAD.left + i * band" :y="PAD.top" :width="band" :height="plotH"
          fill="#ffffff" opacity="0.03"
        />
        <path :d="roundedTop(PAD.left + i * band + band / 2 - barW - 1, d.a, barW)" :fill="colorA" />
        <path :d="roundedTop(PAD.left + i * band + band / 2 + 1, d.b, barW)" :fill="colorB" />
        <text
          :x="PAD.left + i * band + band / 2" :y="H - 10" text-anchor="middle"
          class="fill-text-muted text-[11px]"
        >{{ d.label }}</text>
      </g>

      <line
        :x1="PAD.left" :x2="W - PAD.right" :y1="PAD.top + plotH" :y2="PAD.top + plotH"
        stroke="var(--color-viz-grid)" stroke-width="1"
      />
    </svg>

    <!-- One tooltip, every series: the pointer never has to find a specific bar -->
    <div
      v-if="hovered !== null"
      class="absolute top-0 px-3 py-2 rounded-lg bg-space-black border border-white/15 shadow-xl pointer-events-none text-xs z-10"
      :style="{ left: `${Math.min(78, (hovered / Math.max(1, data.length - 1)) * 70)}%` }"
    >
      <div class="text-text-muted mb-1.5">{{ data[hovered].label }}</div>
      <div class="flex items-center gap-2 mb-1">
        <span class="block w-3 h-0.5 rounded-full" :style="{ backgroundColor: colorA }" />
        <span class="font-semibold text-white tabular-nums">{{ format(data[hovered].a) }}</span>
        <span class="text-text-secondary">{{ seriesA }}</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="block w-3 h-0.5 rounded-full" :style="{ backgroundColor: colorB }" />
        <span class="font-semibold text-white tabular-nums">{{ format(data[hovered].b) }}</span>
        <span class="text-text-secondary">{{ seriesB }}</span>
      </div>
    </div>
  </div>
</template>
