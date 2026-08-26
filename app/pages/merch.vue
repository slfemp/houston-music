<script setup lang="ts">
useHead({
  title: 'Merch — Houston Music Advisory Board',
  meta: [{ name: 'description', content: 'Official Houston Music Advisory Board merchandise. Every purchase supports programming for Houston musicians.' }],
})

const { data: items } = await useFetch('/api/public/merch', { default: () => [] })

const categories = computed(() => ['all', ...new Set((items.value as any[]).map(i => i.category))])
const filter = ref('all')
const shown = computed(() => filter.value === 'all' ? (items.value as any[]) : (items.value as any[]).filter(i => i.category === filter.value))
</script>

<template>
  <div>
    <section class="relative py-20 md:py-28 overflow-hidden">
      <div class="absolute inset-0 bg-linear-to-b from-neon-pink/10 to-transparent" />
      <div class="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h1 class="font-display text-4xl md:text-6xl font-black mb-6">
          <span class="text-gradient">Merch</span>
        </h1>
        <p class="text-lg text-text-secondary max-w-2xl mx-auto">
          Wear it loud. Every purchase goes straight back into programming for Houston musicians.
        </p>
      </div>
    </section>

    <section class="pb-24">
      <div class="max-w-6xl mx-auto px-4 sm:px-6">
        <div v-if="(items as any[]).length">
          <div v-if="categories.length > 2" class="flex flex-wrap gap-2 mb-8 justify-center">
            <button v-for="c in categories" :key="c"
              class="px-4 py-1.5 rounded-full text-sm border capitalize transition-colors"
              :class="filter === c ? 'bg-electric-blue/15 border-electric-blue/40 text-electric-blue' : 'border-white/10 text-text-secondary hover:text-white'"
              @click="filter = c">{{ c }}</button>
          </div>

          <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <article v-for="item in shown" :key="item.id" class="bg-space-gray rounded-2xl border border-white/10 overflow-hidden flex flex-col group hover:border-electric-blue/40 transition-colors">
              <div class="aspect-square bg-space-dark overflow-hidden relative">
                <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                <div v-else class="w-full h-full flex items-center justify-center text-text-muted text-sm">No image</div>
                <div v-if="item.soldOut" class="absolute inset-0 bg-space-black/70 flex items-center justify-center">
                  <span class="px-4 py-2 rounded-full bg-neon-pink/20 border border-neon-pink/40 text-neon-pink text-sm font-semibold">Sold out</span>
                </div>
              </div>

              <div class="p-5 flex-1 flex flex-col">
                <div class="flex items-start justify-between gap-2 mb-2">
                  <h2 class="font-display text-lg font-semibold">{{ item.name }}</h2>
                  <span class="font-bold text-electric-blue shrink-0">{{ item.priceFormatted }}</span>
                </div>
                <p class="text-sm text-text-secondary leading-relaxed flex-1">{{ item.description }}</p>

                <p v-if="item.sizeList.length" class="text-xs text-text-muted mt-3">
                  Sizes: <span class="text-text-secondary">{{ item.sizeList.join(' · ') }}</span>
                </p>

                <a v-if="item.externalUrl && !item.soldOut" :href="item.externalUrl" target="_blank" rel="noopener"
                  class="mt-4 px-6 py-2.5 rounded-full bg-electric-blue text-space-black font-bold text-sm text-center hover:bg-white transition-colors">Buy now</a>
                <p v-else-if="item.availableInPerson && !item.soldOut" class="mt-4 text-xs text-text-muted text-center py-2.5 border border-white/10 rounded-full">
                  Available at our events
                </p>
              </div>
            </article>
          </div>
        </div>

        <div v-else class="text-center py-16 bg-space-gray rounded-2xl border border-white/10">
          <p class="text-text-secondary mb-2">The store is being restocked.</p>
          <p class="text-text-muted text-sm">Check back soon.</p>
        </div>
      </div>
    </section>
  </div>
</template>
