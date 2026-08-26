<script setup lang="ts">
definePageMeta({ layout: 'board', middleware: 'board' })
useHead({ title: 'Events' })

const { canEdit, isOfficer } = useBoardUser()
const scope = ref<'upcoming' | 'past' | 'all'>('upcoming')
const { data: events, refresh } = await useFetch('/api/events', { query: { scope }, default: () => [] })

const error = ref('')
const busy = ref(false)
const expanded = ref<number | null>(null)
const rsvpDetail = ref<any>(null)

async function act(fn: () => Promise<unknown>) {
  error.value = ''; busy.value = true
  try { await fn(); await refresh() } catch (e) { error.value = apiError(e) } finally { busy.value = false }
}

const showForm = ref(false)
const form = reactive({
  title: '', description: '', category: 'community', visibility: 'board', published: false,
  startsAt: '', endsAt: '', location: '', virtualUrl: '', externalRsvpUrl: '',
  rsvpRequired: true, boardRepNote: '',
})

async function create() {
  await act(async () => {
    await $fetch('/api/events', {
      method: 'POST',
      body: {
        ...form,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
        virtualUrl: form.virtualUrl || undefined,
        externalRsvpUrl: form.externalRsvpUrl || undefined,
        location: form.location || undefined,
        boardRepNote: form.boardRepNote || undefined,
      },
    })
    form.title = ''; form.description = ''; form.startsAt = ''; form.location = ''
    showForm.value = false
  })
}

// A board-only event can never be published; keep the checkbox honest.
watch(() => form.visibility, v => { if (v === 'board') form.published = false })

async function loadRsvps(eventId: number) {
  if (expanded.value === eventId) { expanded.value = null; return }
  expanded.value = eventId
  rsvpDetail.value = await $fetch(`/api/events/${eventId}/rsvps`)
}

async function rsvp(eventId: number, response: string) {
  await act(async () => {
    await $fetch(`/api/events/${eventId}/rsvp`, { method: 'POST', body: { response } })
    if (expanded.value === eventId) rsvpDetail.value = await $fetch(`/api/events/${eventId}/rsvps`)
  })
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="font-display text-3xl font-bold">Events</h1>
        <p class="text-text-secondary text-sm mt-1">
          <span class="text-electric-blue">Public</span> events can be published to the website.
          <span class="text-gold-accent">Board</span> events stay internal for attendance confirmation.
        </p>
      </div>
      <button v-if="canEdit" class="px-5 py-2.5 rounded-full bg-electric-blue text-space-black font-bold text-sm hover:bg-white transition-colors" @click="showForm = !showForm">
        {{ showForm ? 'Cancel' : 'Add event' }}
      </button>
    </div>

    <div v-if="error" class="mb-6 px-5 py-4 rounded-xl bg-neon-pink/10 border border-neon-pink/30 text-sm text-neon-pink">{{ error }}</div>

    <form v-if="showForm" class="bg-space-gray rounded-2xl border border-white/10 p-6 mb-8" @submit.prevent="create">
      <div class="grid gap-4 sm:grid-cols-2">
        <label class="block sm:col-span-2"><span class="block text-sm mb-1.5">Title</span>
          <input v-model="form.title" required class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
        <label class="block sm:col-span-2"><span class="block text-sm mb-1.5">Description</span>
          <textarea v-model="form.description" required rows="3" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl resize-y" /></label>

        <label class="block"><span class="block text-sm mb-1.5">Visibility</span>
          <select v-model="form.visibility" class="w-full px-4 py-2.5 bg-space-dark border border-white/10 rounded-xl">
            <option value="board">Board only — internal</option>
            <option value="public">Public — can appear on the site</option>
          </select></label>
        <label class="block"><span class="block text-sm mb-1.5">Category</span>
          <select v-model="form.category" class="w-full px-4 py-2.5 bg-space-dark border border-white/10 rounded-xl">
            <option v-for="c in ['showcase','workshop','community','conference','fundraiser','deadline','civic','other']" :key="c" :value="c">{{ humanize(c) }}</option>
          </select></label>

        <label class="block"><span class="block text-sm mb-1.5">Starts</span>
          <input v-model="form.startsAt" type="datetime-local" required class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
        <label class="block"><span class="block text-sm mb-1.5">Ends <span class="text-text-muted">(optional)</span></span>
          <input v-model="form.endsAt" type="datetime-local" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>

        <label class="block sm:col-span-2"><span class="block text-sm mb-1.5">Location</span>
          <input v-model="form.location" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
        <label class="block"><span class="block text-sm mb-1.5">Virtual link</span>
          <input v-model="form.virtualUrl" type="url" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
        <label class="block"><span class="block text-sm mb-1.5">External RSVP link</span>
          <input v-model="form.externalRsvpUrl" type="url" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>

        <label class="block sm:col-span-2"><span class="block text-sm mb-1.5">Note for board representatives</span>
          <input v-model="form.boardRepNote" placeholder="Who should attend, what to bring…" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>

        <label class="flex items-center gap-3"><input v-model="form.rsvpRequired" type="checkbox" class="w-4 h-4 accent-electric-blue">
          <span class="text-sm">Ask board members to confirm attendance</span></label>
        <label class="flex items-center gap-3" :class="form.visibility === 'board' ? 'opacity-40' : ''">
          <input v-model="form.published" type="checkbox" :disabled="form.visibility === 'board'" class="w-4 h-4 accent-electric-blue">
          <span class="text-sm">Publish to the public site</span></label>
      </div>
      <button type="submit" :disabled="busy" class="mt-5 px-6 py-2.5 rounded-full bg-electric-blue text-space-black font-bold text-sm hover:bg-white disabled:opacity-50">Create event</button>
    </form>

    <div class="flex gap-2 mb-6">
      <button v-for="s in (['upcoming','past','all'] as const)" :key="s"
        class="px-4 py-1.5 rounded-full text-sm border capitalize transition-colors"
        :class="scope === s ? 'bg-electric-blue/15 border-electric-blue/40 text-electric-blue' : 'border-white/10 text-text-secondary hover:text-white'"
        @click="scope = s">{{ s }}</button>
    </div>

    <ul v-if="(events as any[]).length" class="space-y-3">
      <li v-for="e in (events as any[])" :key="e.id" class="bg-space-gray rounded-2xl border border-white/10 p-5"
        :class="e.awaitingMyRsvp ? 'border-gold-accent/40' : ''">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2 mb-1">
              <h3 class="font-semibold">{{ e.title }}</h3>
              <span class="px-2 py-0.5 rounded text-[11px] border"
                :class="e.visibility === 'public' ? 'bg-electric-blue/10 border-electric-blue/30 text-electric-blue' : 'bg-gold-accent/10 border-gold-accent/30 text-gold-accent'">
                {{ e.visibility === 'public' ? 'Public' : 'Board only' }}
              </span>
              <span v-if="e.visibility === 'public'" class="px-2 py-0.5 rounded text-[11px]"
                :class="e.published ? 'bg-electric-blue/15 text-electric-blue' : 'bg-white/5 text-text-muted'">
                {{ e.published ? 'Live on site' : 'Unpublished' }}
              </span>
            </div>
            <p class="text-sm text-text-secondary">{{ formatDateTime(e.startsAt) }}<template v-if="e.location"> · {{ e.location }}</template></p>
            <p class="text-sm text-text-secondary mt-2">{{ e.description }}</p>
            <p v-if="e.boardRepNote" class="text-xs text-gold-accent mt-2">Board note: {{ e.boardRepNote }}</p>
          </div>

          <div class="shrink-0 text-right">
            <div v-if="e.rsvpRequired" class="text-xs text-text-muted mb-2">
              <span class="text-electric-blue font-semibold">{{ e.yes }}</span> yes ·
              {{ e.maybe }} maybe · {{ e.no }} no
            </div>
            <button class="text-xs text-electric-blue hover:text-white transition-colors" @click="loadRsvps(e.id)">
              {{ expanded === e.id ? 'Hide' : 'Who\'s going?' }}
            </button>
          </div>
        </div>

        <!-- This member's own RSVP -->
        <div v-if="e.rsvpRequired" class="mt-4 pt-4 border-t border-white/5">
          <p class="text-xs text-text-secondary mb-2">
            Your response<span v-if="e.myResponse" class="text-electric-blue capitalize"> — {{ e.myResponse }}</span>
            <span v-else class="text-gold-accent"> — not yet confirmed</span>
          </p>
          <div class="flex gap-2">
            <button v-for="r in ['yes','maybe','no']" :key="r" :disabled="busy"
              class="px-4 py-1.5 rounded-full text-sm border capitalize transition-colors disabled:opacity-50"
              :class="e.myResponse === r ? 'bg-electric-blue text-space-black border-electric-blue font-semibold' : 'border-white/15 text-text-secondary hover:text-white hover:border-white/30'"
              @click="rsvp(e.id, r)">{{ r }}</button>
          </div>
        </div>

        <!-- RSVP roster -->
        <div v-if="expanded === e.id && rsvpDetail" class="mt-4 pt-4 border-t border-white/5 grid gap-4 sm:grid-cols-2">
          <div>
            <p class="text-xs uppercase tracking-wide text-text-muted mb-2">Responded</p>
            <ul class="space-y-1">
              <li v-for="r in rsvpDetail.responses" :key="r.userId" class="text-sm flex justify-between gap-2">
                <span>{{ r.name }}</span>
                <span class="capitalize" :class="{ 'text-electric-blue': r.response === 'yes', 'text-text-muted': r.response === 'no' }">{{ r.response }}</span>
              </li>
              <li v-if="!rsvpDetail.responses.length" class="text-sm text-text-muted">No responses yet.</li>
            </ul>
          </div>
          <div>
            <p class="text-xs uppercase tracking-wide text-text-muted mb-2">Awaiting reply</p>
            <ul class="space-y-1">
              <li v-for="a in rsvpDetail.awaiting" :key="a.userId" class="text-sm text-text-secondary">{{ a.name }}</li>
              <li v-if="!rsvpDetail.awaiting.length" class="text-sm text-electric-blue">Everyone has responded.</li>
            </ul>
          </div>
        </div>

        <!-- Admin controls -->
        <div v-if="canEdit" class="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-2 items-center">
          <button v-if="e.visibility === 'public'" :disabled="busy"
            class="px-3 py-1.5 rounded-lg text-xs border border-white/15 hover:border-electric-blue hover:text-electric-blue transition-colors disabled:opacity-50"
            @click="act(() => $fetch(`/api/events/${e.id}`, { method: 'PATCH', body: { published: !e.published } }))">
            {{ e.published ? 'Unpublish' : 'Publish to site' }}
          </button>
          <button :disabled="busy"
            class="px-3 py-1.5 rounded-lg text-xs border border-white/15 hover:border-gold-accent hover:text-gold-accent transition-colors disabled:opacity-50"
            @click="act(() => $fetch(`/api/events/${e.id}`, { method: 'PATCH', body: { visibility: e.visibility === 'public' ? 'board' : 'public' } }))">
            Make {{ e.visibility === 'public' ? 'board only' : 'public' }}
          </button>
          <button v-if="isOfficer" :disabled="busy" class="ml-auto text-xs text-text-muted hover:text-neon-pink transition-colors"
            @click="act(() => $fetch(`/api/events/${e.id}`, { method: 'DELETE' }))">Delete</button>
        </div>
      </li>
    </ul>

    <p v-else class="py-12 text-center text-text-muted">No {{ scope }} events.</p>
  </div>
</template>
