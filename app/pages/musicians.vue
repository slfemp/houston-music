<script setup lang="ts">
useHead({
  title: 'Houston Musicians — Houston Music Advisory Board',
  meta: [{ name: 'description', content: 'A directory of Houston musicians, producers, and ensembles. Find collaborators, book an artist, or add yourself to the list.' }],
})

const { data: musicians, refresh } = await useFetch('/api/public/musicians', { default: () => [] })

const query = ref('')
const actFilter = ref('all')
const bookingOnly = ref(false)

const actTypes = computed(() => ['all', ...new Set((musicians.value as any[]).map(m => m.actType))])

const shown = computed(() => {
  const q = query.value.trim().toLowerCase()
  return (musicians.value as any[]).filter((m) => {
    if (actFilter.value !== 'all' && m.actType !== actFilter.value) return false
    if (bookingOnly.value && !m.availableForBooking) return false
    if (!q) return true
    return [m.displayName, m.genres, m.neighborhood].filter(Boolean).join(' ').toLowerCase().includes(q)
  })
})

const label = (s: string) => s.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())

// --- Sign-up ---
const LOOKING_FOR = ['gigs', 'collaborators', 'session_work', 'bandmates', 'representation', 'studio_time', 'mentorship']
const showForm = ref(false)
const submitting = ref(false)
const done = ref<{ already: boolean } | null>(null)
const error = ref('')

const form = reactive({
  name: '', stageName: '', email: '', phone: '', actType: 'solo',
  genres: '', neighborhood: '', bio: '', yearsActive: undefined as number | undefined,
  memberCount: undefined as number | undefined,
  websiteUrl: '', streamingUrl: '', socialUrl: '',
  lookingFor: [] as string[], availableForBooking: true, listed: true,
})

async function submit() {
  error.value = ''
  submitting.value = true
  try {
    const res: any = await $fetch('/api/musicians', { method: 'POST', body: { ...form } })
    done.value = { already: res.alreadyRegistered }
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Something went wrong. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <section class="relative py-20 md:py-24 overflow-hidden">
      <div class="absolute inset-0 bg-linear-to-b from-electric-blue/10 to-transparent" />
      <div class="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h1 class="font-display text-4xl md:text-6xl font-black mb-6">
          Houston <span class="text-gradient">Musicians</span>
        </h1>
        <p class="text-lg text-text-secondary max-w-2xl mx-auto mb-8">
          Artists, producers, and ensembles working in Houston right now.
          Add yourself so promoters, venues, and other players can find you.
        </p>
        <button
          class="px-8 py-3.5 rounded-full bg-electric-blue text-space-black font-bold hover:bg-white transition-all duration-300 hover:scale-105"
          @click="showForm = true; done = null"
        >Add yourself to the directory</button>
      </div>
    </section>

    <section class="pb-24">
      <div class="max-w-6xl mx-auto px-4 sm:px-6">
        <div class="flex flex-wrap gap-3 mb-8 items-center">
          <input
            v-model="query" type="search" placeholder="Search name, genre, or neighborhood"
            class="flex-1 min-w-[220px] px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-hidden focus:border-electric-blue"
          >
          <select v-model="actFilter" class="px-4 py-2.5 bg-space-dark border border-white/10 rounded-xl text-sm">
            <option v-for="t in actTypes" :key="t" :value="t">{{ t === 'all' ? 'All types' : label(t) }}</option>
          </select>
          <label class="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-sm cursor-pointer">
            <input v-model="bookingOnly" type="checkbox" class="w-4 h-4 accent-electric-blue">
            Available to book
          </label>
        </div>

        <p class="text-sm text-text-muted mb-6">{{ shown.length }} artist{{ shown.length === 1 ? '' : 's' }}</p>

        <div v-if="shown.length" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <article v-for="m in shown" :key="m.id" class="bg-space-gray rounded-2xl border border-white/10 p-6 flex flex-col hover:border-electric-blue/40 transition-colors">
            <div class="flex items-start justify-between gap-2 mb-1">
              <h2 class="font-display text-lg font-semibold">{{ m.displayName }}</h2>
              <span class="px-2 py-0.5 rounded text-[11px] bg-white/5 text-text-secondary shrink-0">{{ label(m.actType) }}</span>
            </div>
            <p v-if="m.neighborhood" class="text-xs text-text-muted mb-3">
              {{ m.neighborhood }}<template v-if="m.yearsActive"> · {{ m.yearsActive }} yrs</template><template v-if="m.memberCount && m.memberCount > 1"> · {{ m.memberCount }} members</template>
            </p>

            <div class="flex flex-wrap gap-1.5 mb-3">
              <span v-for="g in m.genreList" :key="g" class="px-2 py-0.5 rounded text-[11px] bg-electric-blue/10 text-electric-blue border border-electric-blue/20">{{ g }}</span>
            </div>

            <p v-if="m.bio" class="text-sm text-text-secondary leading-relaxed flex-1">{{ m.bio }}</p>

            <div v-if="m.lookingForList.length" class="mt-3 pt-3 border-t border-white/5">
              <p class="text-[11px] uppercase tracking-wide text-text-muted mb-1.5">Looking for</p>
              <div class="flex flex-wrap gap-1.5">
                <span v-for="l in m.lookingForList" :key="l" class="px-2 py-0.5 rounded text-[11px] bg-gold-accent/10 text-gold-accent border border-gold-accent/20">{{ label(l) }}</span>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-3 mt-4">
              <a v-if="m.streamingUrl" :href="m.streamingUrl" target="_blank" rel="noopener" class="text-sm text-electric-blue hover:text-white transition-colors">Listen →</a>
              <a v-if="m.socialUrl" :href="m.socialUrl" target="_blank" rel="noopener" class="text-sm text-text-secondary hover:text-white transition-colors">Social</a>
              <span v-if="m.availableForBooking" class="ml-auto text-[11px] text-electric-blue">Available to book</span>
            </div>
          </article>
        </div>

        <div v-else class="text-center py-16 bg-space-gray rounded-2xl border border-white/10">
          <p class="text-text-secondary">No artists match those filters.</p>
        </div>
      </div>
    </section>

    <!-- Sign-up dialog -->
    <div v-if="showForm" class="fixed inset-0 z-50 flex items-start justify-center p-4 py-10 bg-space-black/85 backdrop-blur-sm overflow-y-auto" @click.self="showForm = false">
      <div class="w-full max-w-lg bg-space-gray rounded-2xl border border-white/10 p-6">
        <div class="flex items-start justify-between gap-3 mb-1">
          <h2 class="font-display text-xl font-semibold">Join the directory</h2>
          <button class="text-text-muted hover:text-white transition-colors" aria-label="Close" @click="showForm = false">✕</button>
        </div>

        <div v-if="done" class="text-center py-8">
          <p class="text-electric-blue font-medium mb-2">{{ done.already ? "You're already on the list" : 'Submitted for review' }}</p>
          <p class="text-text-secondary text-sm">
            {{ done.already
              ? 'That email is already registered. Contact us if you need your listing updated.'
              : 'A board member reviews each submission before it appears publicly. This usually takes a few days.' }}
          </p>
          <button class="mt-5 px-6 py-2.5 rounded-full border border-white/15 text-sm hover:border-white/40 transition-colors" @click="showForm = false">Close</button>
        </div>

        <form v-else class="mt-4" @submit.prevent="submit">
          <p class="text-sm text-text-secondary mb-5">
            Your email and phone are for board use only and are never shown publicly.
          </p>
          <div v-if="error" class="mb-4 px-4 py-3 rounded-xl bg-neon-pink/10 border border-neon-pink/30 text-sm text-neon-pink">{{ error }}</div>

          <div class="grid gap-4 sm:grid-cols-2">
            <label class="block"><span class="block text-sm mb-1.5">Your name</span>
              <input v-model="form.name" required class="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-hidden focus:border-electric-blue"></label>
            <label class="block"><span class="block text-sm mb-1.5">Artist / band name</span>
              <input v-model="form.stageName" class="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-hidden focus:border-electric-blue"></label>
            <label class="block"><span class="block text-sm mb-1.5">Email</span>
              <input v-model="form.email" type="email" required class="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-hidden focus:border-electric-blue"></label>
            <label class="block"><span class="block text-sm mb-1.5">Phone <span class="text-text-muted">(optional)</span></span>
              <input v-model="form.phone" type="tel" class="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-hidden focus:border-electric-blue"></label>
            <label class="block"><span class="block text-sm mb-1.5">Type</span>
              <select v-model="form.actType" class="w-full px-3.5 py-2.5 bg-space-dark border border-white/10 rounded-xl text-sm">
                <option v-for="t in ['solo','band','duo','dj','producer','composer','ensemble','other']" :key="t" :value="t">{{ label(t) }}</option>
              </select></label>
            <label class="block"><span class="block text-sm mb-1.5">Neighborhood</span>
              <input v-model="form.neighborhood" placeholder="Third Ward, Heights…" class="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-hidden focus:border-electric-blue"></label>
            <label class="block sm:col-span-2"><span class="block text-sm mb-1.5">Genres <span class="text-text-muted">(comma separated)</span></span>
              <input v-model="form.genres" placeholder="hip hop, soul, cumbia" class="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-hidden focus:border-electric-blue"></label>
            <label class="block"><span class="block text-sm mb-1.5">Years active</span>
              <input v-model.number="form.yearsActive" type="number" min="0" class="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-hidden focus:border-electric-blue"></label>
            <label class="block"><span class="block text-sm mb-1.5">Members</span>
              <input v-model.number="form.memberCount" type="number" min="1" class="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-hidden focus:border-electric-blue"></label>
            <label class="block sm:col-span-2"><span class="block text-sm mb-1.5">Short bio</span>
              <textarea v-model="form.bio" rows="3" class="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm resize-y focus:outline-hidden focus:border-electric-blue" /></label>
            <label class="block"><span class="block text-sm mb-1.5">Streaming link</span>
              <input v-model="form.streamingUrl" type="url" placeholder="https://" class="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-hidden focus:border-electric-blue"></label>
            <label class="block"><span class="block text-sm mb-1.5">Social link</span>
              <input v-model="form.socialUrl" type="url" placeholder="https://" class="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-hidden focus:border-electric-blue"></label>
          </div>

          <fieldset class="mt-5">
            <legend class="text-sm mb-2">What are you looking for?</legend>
            <div class="flex flex-wrap gap-2">
              <label v-for="l in LOOKING_FOR" :key="l" class="cursor-pointer">
                <input v-model="form.lookingFor" type="checkbox" :value="l" class="peer sr-only">
                <span class="block px-3 py-1.5 rounded-full text-xs border border-white/15 text-text-secondary peer-checked:bg-electric-blue peer-checked:text-space-black peer-checked:border-electric-blue peer-checked:font-semibold transition-colors">
                  {{ label(l) }}
                </span>
              </label>
            </div>
          </fieldset>

          <label class="flex items-center gap-3 mt-5">
            <input v-model="form.availableForBooking" type="checkbox" class="w-4 h-4 accent-electric-blue">
            <span class="text-sm">I'm available for booking</span>
          </label>
          <label class="flex items-center gap-3 mt-2">
            <input v-model="form.listed" type="checkbox" class="w-4 h-4 accent-electric-blue">
            <span class="text-sm">Show my listing publicly once approved</span>
          </label>

          <button type="submit" :disabled="submitting" class="mt-6 w-full px-6 py-3 rounded-full bg-electric-blue text-space-black font-bold text-sm hover:bg-white transition-colors disabled:opacity-50">
            {{ submitting ? 'Submitting…' : 'Submit for review' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
