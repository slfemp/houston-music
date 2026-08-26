<script setup lang="ts">
useHead({
  title: 'Volunteer — Houston Music Advisory Board',
  meta: [{ name: 'description', content: 'Volunteer with the Houston Music Advisory Board. Help at showcases, workshops, and community events supporting Houston musicians.' }],
})

const { data: opportunities, refresh } = await useFetch('/api/volunteer/opportunities', { default: () => [] })

const selected = ref<any>(null)
const submitting = ref(false)
const result = ref<{ status: string, already: boolean } | null>(null)
const error = ref('')

const form = reactive({ name: '', email: '', phone: '', organization: '', message: '' })

function openForm(opp: any) {
  selected.value = opp
  result.value = null
  error.value = ''
}

async function submit() {
  error.value = ''
  submitting.value = true
  try {
    const res: any = await $fetch('/api/volunteer/signup', {
      method: 'POST',
      body: { opportunityId: selected.value.id, ...form },
    })
    result.value = { status: res.status, already: res.alreadySignedUp }
    form.name = ''; form.email = ''; form.phone = ''; form.organization = ''; form.message = ''
    await refresh()
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Something went wrong. Please try again.'
  } finally {
    submitting.value = false
  }
}

function fmt(value: string | null) {
  if (!value) return null
  return new Date(value).toLocaleString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago',
  })
}
</script>

<template>
  <div>
    <section class="relative py-20 md:py-28 overflow-hidden">
      <div class="absolute inset-0 bg-linear-to-b from-electric-purple/10 to-transparent" />
      <div class="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h1 class="font-display text-4xl md:text-6xl font-black mb-6">
          Volunteer with <span class="text-gradient">HMAB</span>
        </h1>
        <p class="text-lg text-text-secondary max-w-2xl mx-auto">
          Houston's music community runs on the people who show up. Lend a few hours to a showcase,
          a workshop, or a listening session — no music-industry experience required.
        </p>
      </div>
    </section>

    <section class="pb-24">
      <div class="max-w-5xl mx-auto px-4 sm:px-6">
        <div v-if="(opportunities as any[]).length" class="grid gap-6 md:grid-cols-2">
          <article
            v-for="opp in (opportunities as any[])" :key="opp.id"
            class="bg-space-gray rounded-2xl border border-white/10 p-6 flex flex-col hover:border-electric-blue/40 transition-colors"
          >
            <div class="flex items-start justify-between gap-3 mb-2">
              <h2 class="font-display text-xl font-semibold">{{ opp.title }}</h2>
              <span
                v-if="opp.full"
                class="px-3 py-1 rounded-full text-xs bg-gold-accent/15 text-gold-accent border border-gold-accent/30 shrink-0"
              >Waitlist</span>
              <span
                v-else-if="opp.slotsRemaining !== null"
                class="px-3 py-1 rounded-full text-xs bg-electric-blue/10 text-electric-blue border border-electric-blue/30 shrink-0"
              >{{ opp.slotsRemaining }} spot{{ opp.slotsRemaining === 1 ? '' : 's' }} left</span>
            </div>

            <p v-if="opp.startsAt" class="text-sm text-electric-blue mb-1">{{ fmt(opp.startsAt) }}</p>
            <p v-if="opp.location" class="text-sm text-text-muted mb-3">{{ opp.location }}</p>

            <p class="text-text-secondary text-sm leading-relaxed flex-1">{{ opp.description }}</p>

            <p v-if="opp.skillsWanted" class="text-xs text-text-muted mt-3">
              <span class="text-text-secondary">Helpful:</span> {{ opp.skillsWanted }}
            </p>

            <button
              class="mt-5 px-6 py-3 rounded-full bg-electric-blue text-space-black font-bold text-sm hover:bg-white transition-colors"
              @click="openForm(opp)"
            >{{ opp.full ? 'Join the waitlist' : 'Sign up' }}</button>
          </article>
        </div>

        <div v-else class="text-center py-16 bg-space-gray rounded-2xl border border-white/10">
          <p class="text-text-secondary mb-2">No open volunteer opportunities right now.</p>
          <p class="text-text-muted text-sm">
            Check back soon, or <NuxtLink to="/contact" class="text-electric-blue hover:text-white transition-colors">get in touch</NuxtLink> to be added to the list.
          </p>
        </div>
      </div>
    </section>

    <!-- Sign-up dialog -->
    <div
      v-if="selected"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-black/80 backdrop-blur-sm"
      @click.self="selected = null"
    >
      <div class="w-full max-w-md bg-space-gray rounded-2xl border border-white/10 p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-start justify-between gap-3 mb-1">
          <h2 class="font-display text-xl font-semibold">{{ selected.title }}</h2>
          <button class="text-text-muted hover:text-white transition-colors shrink-0" aria-label="Close" @click="selected = null">✕</button>
        </div>
        <p v-if="selected.startsAt" class="text-sm text-electric-blue mb-5">{{ fmt(selected.startsAt) }}</p>

        <div v-if="result" class="text-center py-6">
          <p v-if="result.already" class="text-gold-accent font-medium mb-2">You're already signed up</p>
          <p v-else-if="result.status === 'waitlisted'" class="text-gold-accent font-medium mb-2">You're on the waitlist</p>
          <p v-else class="text-electric-blue font-medium mb-2">You're signed up</p>
          <p class="text-text-secondary text-sm">
            {{ result.status === 'waitlisted'
              ? "We'll reach out if a spot opens up."
              : "We'll follow up by email with the details." }}
          </p>
          <button class="mt-5 px-6 py-2.5 rounded-full border border-white/15 text-sm hover:border-white/40 transition-colors" @click="selected = null">Close</button>
        </div>

        <form v-else @submit.prevent="submit">
          <div v-if="error" class="mb-4 px-4 py-3 rounded-xl bg-neon-pink/10 border border-neon-pink/30 text-sm text-neon-pink">{{ error }}</div>

          <label class="block mb-4">
            <span class="block text-sm font-medium mb-1.5">Name</span>
            <input v-model="form.name" required class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-hidden focus:border-electric-blue">
          </label>
          <label class="block mb-4">
            <span class="block text-sm font-medium mb-1.5">Email</span>
            <input v-model="form.email" type="email" required class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-hidden focus:border-electric-blue">
          </label>
          <div class="grid grid-cols-2 gap-3 mb-4">
            <label class="block">
              <span class="block text-sm font-medium mb-1.5">Phone</span>
              <input v-model="form.phone" type="tel" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-hidden focus:border-electric-blue">
            </label>
            <label class="block">
              <span class="block text-sm font-medium mb-1.5">Organization</span>
              <input v-model="form.organization" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-hidden focus:border-electric-blue">
            </label>
          </div>
          <label class="block mb-5">
            <span class="block text-sm font-medium mb-1.5">Anything we should know? <span class="text-text-muted font-normal">(optional)</span></span>
            <textarea v-model="form.message" rows="3" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm resize-y focus:outline-hidden focus:border-electric-blue" />
          </label>

          <button type="submit" :disabled="submitting" class="w-full px-6 py-3 rounded-full bg-electric-blue text-space-black font-bold text-sm hover:bg-white transition-colors disabled:opacity-50">
            {{ submitting ? 'Submitting…' : selected.full ? 'Join the waitlist' : 'Sign me up' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
