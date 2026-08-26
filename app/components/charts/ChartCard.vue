<script setup lang="ts">
/**
 * Shared chart frame: title, optional legend, and a table view.
 *
 * The table is not a nicety - it is the accessibility floor. Every value a
 * tooltip reveals stays reachable without hovering, which is what lets the
 * charts use selective direct labels instead of labelling every mark.
 */
withDefaults(defineProps<{
  title: string
  subtitle?: string
  /** Rendered as coloured keys beside text; the text itself stays in ink tokens. */
  legend?: Array<{ label: string, color: string, shape?: 'rect' | 'line' }>
  hasTable?: boolean
}>(), { hasTable: true })

const showTable = ref(false)
</script>

<template>
  <section class="bg-space-gray rounded-2xl border border-white/10 p-5 sm:p-6">
    <header class="flex flex-wrap items-start justify-between gap-3 mb-1">
      <div class="min-w-0">
        <h3 class="font-display text-lg font-semibold">{{ title }}</h3>
        <p v-if="subtitle" class="text-sm text-text-secondary mt-0.5">{{ subtitle }}</p>
      </div>
      <button
        v-if="hasTable"
        class="shrink-0 text-xs px-3 py-1.5 rounded-lg border border-white/10 text-text-muted hover:text-white hover:border-white/30 transition-colors"
        :aria-pressed="showTable"
        @click="showTable = !showTable"
      >{{ showTable ? 'Chart' : 'Table' }}</button>
    </header>

    <!-- Legend: present whenever there are two or more series -->
    <ul v-if="legend && legend.length > 1" class="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 mb-1">
      <li v-for="key in legend" :key="key.label" class="flex items-center gap-2 text-xs text-text-secondary">
        <span
          v-if="key.shape === 'line'"
          class="block w-4 h-0.5 rounded-full shrink-0"
          :style="{ backgroundColor: key.color }"
        />
        <span v-else class="block w-3 h-3 rounded-sm shrink-0" :style="{ backgroundColor: key.color }" />
        {{ key.label }}
      </li>
    </ul>

    <div v-show="!showTable" class="mt-4">
      <slot />
    </div>

    <div v-show="showTable" class="mt-4 overflow-x-auto">
      <slot name="table" />
    </div>
  </section>
</template>
