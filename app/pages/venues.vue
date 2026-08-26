<script setup lang="ts">
useHead({
  title: 'Venues That Book — Houston Music Advisory Board',
  meta: [{ name: 'description', content: 'A directory of Houston venues that book live music: capacity, who to contact, whether they take submissions, and how artists get paid.' }],
})

const { data: venues } = await useFetch('/api/public/venues', { default: () => [] })

const query = ref('')
const typeFilter = ref('all')
const submissionsOnly = ref(false)

const types = computed(() => ['all', ...new Set((venues.value as any[]).map(v => v.venueType))])

const shown = computed(() => {
  const q = query.value.trim().toLowerCase()
  return (venues.value as any[]).filter((v) => {
    if (typeFilter.value !== 'all' && v.venueType !== typeFilter.value) return false
    if (submissionsOnly.value && !v.acceptsSubmissions) return false
    if (!q) return true
    return [v.name, v.neighborhood, v.genresBooked].filter(Boolean).join(' ').toLowerCase().includes(q)
  })
})

const label = (s: string) => s.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())
</script>

<template>
  <div>
    <section class="relative py-20 md:py-24 overflow-hidden">
      <div class="absolute inset-0 bg-linear-to-b from-electric-purple/10 to-transparent" />
      <div class="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h1 class="font-display text-4xl md:text-6xl font-black mb-6">
          Venues That <span class="text-gradient">Book</span>
        </h1>
        <p class="text-lg text-text-secondary max-w-2xl mx-auto">
          Who books live music in Houston, how to reach them, and how artists get paid —
          the three things nobody publishes in one place.
        </p>
      </div>
    </section>

    <section class="pb-24">
      <div class="max-w-6xl mx-auto px-4 sm:px-6">
        <!-- Filters in one row above the results -->
        <div class="flex flex-wrap gap-3 mb-8 items-center">
          <input
            v-model="query" type="search" placeholder="Search name, neighborhood, or genre"
            class="flex-1 min-w-[220px] px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-hidden focus:border-electric-blue"
          >
          <select v-model="typeFilter" class="px-4 py-2.5 bg-space-dark border border-white/10 rounded-xl text-sm">
            <option v-for="t in types" :key="t" :value="t">{{ t === 'all' ? 'All venue types' : label(t) }}</option>
          </select>
          <label class="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-sm cursor-pointer">
            <input v-model="submissionsOnly" type="checkbox" class="w-4 h-4 accent-electric-blue">
            Takes submissions
          </label>
        </div>

        <p class="text-sm text-text-muted mb-6">{{ shown.length }} venue{{ shown.length === 1 ? '' : 's' }}</p>

        <div v-if="shown.length" class="grid gap-5 md:grid-cols-2">
          <article v-for="v in shown" :key="v.id" class="bg-space-gray rounded-2xl border border-white/10 p-6 hover:border-electric-blue/40 transition-colors">
            <div class="flex flex-wrap items-start justify-between gap-2 mb-2">
              <h2 class="font-display text-xl font-semibold">{{ v.name }}</h2>
              <span class="px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-text-secondary shrink-0">{{ label(v.venueType) }}</span>
            </div>

            <p class="text-sm text-text-muted mb-3">
              {{ v.neighborhood }}<template v-if="v.capacity"> · cap. {{ v.capacity.toLocaleString() }}</template>
            </p>

            <div class="flex flex-wrap gap-1.5 mb-4">
              <span v-for="g in v.genreList" :key="g" class="px-2 py-0.5 rounded text-[11px] bg-electric-purple/10 text-electric-purple border border-electric-purple/20">{{ g }}</span>
            </div>

            <dl class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
              <div>
                <dt class="text-xs text-text-muted">Submissions</dt>
                <dd :class="v.acceptsSubmissions ? 'text-electric-blue' : 'text-text-secondary'">
                  {{ v.acceptsSubmissions ? 'Open' : 'Not accepted' }}
                </dd>
              </div>
              <div>
                <dt class="text-xs text-text-muted">Pay structure</dt>
                <dd class="text-text-secondary">{{ v.paysLabel }}</dd>
              </div>
              <div>
                <dt class="text-xs text-text-muted">All ages</dt>
                <dd class="text-text-secondary">{{ v.allAges ? 'Yes' : 'No' }}</dd>
              </div>
              <div>
                <dt class="text-xs text-text-muted">Backline / engineer</dt>
                <dd class="text-text-secondary">
                  {{ v.hasBackline ? 'Backline' : 'No backline' }}<template v-if="v.hasSoundEngineer"> · engineer</template>
                </dd>
              </div>
            </dl>

            <p v-if="v.submissionNotes" class="text-sm text-text-secondary leading-relaxed border-t border-white/5 pt-3">
              {{ v.submissionNotes }}
            </p>
            <p v-if="v.stageNotes" class="text-xs text-text-muted mt-2">{{ v.stageNotes }}</p>

            <div class="flex flex-wrap items-center gap-3 mt-4">
              <a v-if="v.submissionUrl" :href="v.submissionUrl" target="_blank" rel="noopener"
                class="px-5 py-2 rounded-full bg-electric-blue text-space-black font-bold text-sm hover:bg-white transition-colors">Submit</a>
              <a v-if="v.websiteUrl" :href="v.websiteUrl" target="_blank" rel="noopener"
                class="text-sm text-electric-blue hover:text-white transition-colors">Website →</a>
              <span
                class="ml-auto text-[11px]"
                :class="v.verifiedDaysAgo === null ? 'text-gold-accent' : 'text-text-muted'"
              >
                {{ v.verifiedDaysAgo === null ? 'Booking contact unverified' : `Verified ${v.verifiedDaysAgo}d ago` }}
              </span>
            </div>
          </article>
        </div>

        <div v-else class="text-center py-16 bg-space-gray rounded-2xl border border-white/10">
          <p class="text-text-secondary">No venues match those filters.</p>
        </div>

        <p class="text-xs text-text-muted mt-8 text-center max-w-2xl mx-auto">
          Run a venue and want your booking details listed or corrected?
          <NuxtLink to="/contact" class="text-electric-blue hover:text-white transition-colors">Let us know</NuxtLink>.
        </p>
      </div>
    </section>
  </div>
</template>
