<script setup lang="ts">
definePageMeta({ layout: 'board', middleware: 'board' })
useHead({ title: 'Meetings' })

const { isOfficer, canEdit } = useBoardUser()
const scope = ref<'upcoming' | 'past' | 'all'>('upcoming')

const { data: meetings, refresh, pending } = await useFetch('/api/meetings', {
  query: { scope }, default: () => [],
})

const showForm = ref(false)
const error = ref('')
const busy = ref(false)
const form = reactive({
  title: '', type: 'regular', startsAt: '', location: '', virtualUrl: '',
  noticeRequiredHours: 72, useStandardAgenda: true,
})

async function create() {
  error.value = ''
  busy.value = true
  try {
    const meeting = await $fetch('/api/meetings', {
      method: 'POST',
      body: { ...form, startsAt: new Date(form.startsAt).toISOString(), virtualUrl: form.virtualUrl || undefined },
    })
    showForm.value = false
    await navigateTo(`/board/meetings/${(meeting as any).id}`)
  } catch (err) {
    error.value = apiError(err)
  } finally {
    busy.value = false
  }
}

const statusStyles: Record<string, string> = {
  draft: 'bg-white/5 text-text-secondary border-white/10',
  noticed: 'bg-electric-blue/10 text-electric-blue border-electric-blue/30',
  in_progress: 'bg-gold-accent/15 text-gold-accent border-gold-accent/40',
  adjourned: 'bg-white/5 text-text-muted border-white/10',
  cancelled: 'bg-neon-pink/10 text-neon-pink border-neon-pink/30',
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <h1 class="font-display text-3xl font-bold">Meetings</h1>
      <button
        v-if="canEdit"
        class="px-5 py-2.5 rounded-full bg-electric-blue text-space-black font-bold text-sm hover:bg-white transition-colors"
        @click="showForm = !showForm"
      >{{ showForm ? 'Cancel' : 'Schedule meeting' }}</button>
    </div>

    <form v-if="showForm" class="bg-space-gray rounded-2xl border border-white/10 p-6 mb-8" @submit.prevent="create">
      <h2 class="font-display text-lg font-semibold mb-4">Schedule a meeting</h2>
      <div v-if="error" class="mb-4 px-4 py-3 rounded-xl bg-neon-pink/10 border border-neon-pink/30 text-sm text-neon-pink">{{ error }}</div>

      <div class="grid gap-4 sm:grid-cols-2">
        <label class="block sm:col-span-2">
          <span class="block text-sm font-medium mb-1.5">Title</span>
          <input v-model="form.title" required class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-hidden focus:border-electric-blue" placeholder="Regular Meeting of the Board">
        </label>
        <label class="block">
          <span class="block text-sm font-medium mb-1.5">Type</span>
          <select v-model="form.type" class="w-full px-4 py-2.5 bg-space-dark border border-white/10 rounded-xl focus:outline-hidden focus:border-electric-blue">
            <option value="regular">Regular</option>
            <option value="special">Special</option>
            <option value="committee">Committee</option>
            <option value="workshop">Workshop</option>
            <option value="listening_session">Listening session</option>
            <option value="emergency">Emergency</option>
          </select>
        </label>
        <label class="block">
          <span class="block text-sm font-medium mb-1.5">Date &amp; time</span>
          <input v-model="form.startsAt" type="datetime-local" required class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-hidden focus:border-electric-blue">
        </label>
        <label class="block sm:col-span-2">
          <span class="block text-sm font-medium mb-1.5">Location</span>
          <input v-model="form.location" required class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-hidden focus:border-electric-blue" placeholder="City Hall, 901 Bagby Street">
        </label>
        <label class="block sm:col-span-2">
          <span class="block text-sm font-medium mb-1.5">Virtual link <span class="text-text-muted font-normal">(optional)</span></span>
          <input v-model="form.virtualUrl" type="url" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-hidden focus:border-electric-blue" placeholder="https://…">
        </label>
        <label class="block">
          <span class="block text-sm font-medium mb-1.5">Required notice (hours)</span>
          <input v-model.number="form.noticeRequiredHours" type="number" min="0" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-hidden focus:border-electric-blue">
        </label>
        <label class="flex items-center gap-3 sm:col-span-2">
          <input v-model="form.useStandardAgenda" type="checkbox" class="w-4 h-4 accent-electric-blue">
          <span class="text-sm">Start from the standard order of business <span class="text-text-muted">(call to order → roll call → … → adjournment)</span></span>
        </label>
      </div>

      <button type="submit" :disabled="busy" class="mt-6 px-6 py-2.5 rounded-full bg-electric-blue text-space-black font-bold text-sm hover:bg-white transition-colors disabled:opacity-50">
        {{ busy ? 'Creating…' : 'Create meeting' }}
      </button>
    </form>

    <div class="flex gap-2 mb-6">
      <button
        v-for="s in (['upcoming','past','all'] as const)" :key="s"
        class="px-4 py-1.5 rounded-full text-sm border transition-colors capitalize"
        :class="scope === s ? 'bg-electric-blue/15 border-electric-blue/40 text-electric-blue' : 'border-white/10 text-text-secondary hover:text-white'"
        @click="scope = s"
      >{{ s }}</button>
    </div>

    <div v-if="pending" class="py-12 text-center text-text-muted">Loading…</div>

    <ul v-else-if="(meetings as any[]).length" class="space-y-3">
      <li v-for="m in (meetings as any[])" :key="m.id">
        <NuxtLink
          :to="`/board/meetings/${m.id}`"
          class="block bg-space-gray rounded-2xl border border-white/10 p-5 hover:border-electric-blue/50 transition-colors group"
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0">
              <h3 class="font-semibold group-hover:text-electric-blue transition-colors">{{ m.title }}</h3>
              <p class="text-sm text-text-secondary mt-1">{{ formatDateTime(m.startsAt) }}</p>
              <p class="text-sm text-text-muted">{{ m.location }}</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <span class="px-3 py-1 rounded-full text-xs border capitalize" :class="statusStyles[m.status]">{{ humanize(m.status) }}</span>
              <span v-if="m.minutesStatus === 'approved'" class="px-3 py-1 rounded-full text-xs border bg-electric-blue/10 border-electric-blue/30 text-electric-blue">Minutes adopted</span>
              <span v-else-if="m.minutesStatus === 'draft'" class="px-3 py-1 rounded-full text-xs border bg-white/5 border-white/10 text-text-muted">Minutes in draft</span>
            </div>
          </div>
        </NuxtLink>
      </li>
    </ul>

    <p v-else class="py-12 text-center text-text-muted">No {{ scope }} meetings.</p>
  </div>
</template>
