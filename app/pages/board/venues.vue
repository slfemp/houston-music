<script setup lang="ts">
definePageMeta({ layout: 'board', middleware: 'board' })
useHead({ title: 'Venues' })

const { canEdit, isOfficer } = useBoardUser()
const { data: venues, refresh } = await useFetch('/api/venues', { default: () => [] })

const error = ref('')
const busy = ref(false)
async function act(fn: () => Promise<unknown>) {
  error.value = ''; busy.value = true
  try { await fn(); await refresh() } catch (e) { error.value = apiError(e) } finally { busy.value = false }
}

const showForm = ref(false)
const editingId = ref<number | null>(null)
const blank = () => ({
  name: '', address: '', neighborhood: '', venueType: 'club', capacity: undefined as number | undefined,
  genresBooked: '', acceptsSubmissions: false, paysArtists: 'varies',
  bookingContactName: '', bookingEmail: '', bookingPhone: '', submissionUrl: '', submissionNotes: '',
  allAges: false, hasBackline: false, hasSoundEngineer: false, stageNotes: '',
  websiteUrl: '', socialUrl: '', published: false, markVerified: true,
})
const form = reactive(blank())

function edit(v: any) {
  editingId.value = v.id
  Object.assign(form, blank(), {
    ...v,
    capacity: v.capacity ?? undefined,
    genresBooked: v.genresBooked ?? '', address: v.address ?? '', neighborhood: v.neighborhood ?? '',
    bookingContactName: v.bookingContactName ?? '', bookingEmail: v.bookingEmail ?? '',
    bookingPhone: v.bookingPhone ?? '', submissionUrl: v.submissionUrl ?? '',
    submissionNotes: v.submissionNotes ?? '', stageNotes: v.stageNotes ?? '',
    websiteUrl: v.websiteUrl ?? '', socialUrl: v.socialUrl ?? '', markVerified: false,
  })
  showForm.value = true
}

async function save() {
  await act(async () => {
    const body: any = { ...form }
    if (!body.capacity) delete body.capacity
    if (editingId.value) await $fetch(`/api/venues/${editingId.value}`, { method: 'PATCH', body })
    else await $fetch('/api/venues', { method: 'POST', body })
    Object.assign(form, blank())
    editingId.value = null
    showForm.value = false
  })
}

const unverified = computed(() => (venues.value as any[]).filter(v => !v.verifiedAt).length)
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="font-display text-3xl font-bold">Venues</h1>
        <p class="text-text-secondary text-sm mt-1">
          Booking directory shown at <NuxtLink to="/venues" class="text-electric-blue hover:text-white">/venues</NuxtLink>.
          Mirrors vetted venues from the <NuxtLink to="/board/network" class="text-electric-blue hover:text-white">Network</NuxtLink> —
          approving a proposed venue there adds it here.
        </p>
      </div>
      <button v-if="canEdit" class="px-5 py-2.5 rounded-full bg-electric-blue text-space-black font-bold text-sm hover:bg-white transition-colors"
        @click="showForm ? (showForm = false, editingId = null, Object.assign(form, blank())) : showForm = true">
        {{ showForm ? 'Cancel' : 'Add venue' }}
      </button>
    </div>

    <div v-if="error" class="mb-6 px-5 py-4 rounded-xl bg-neon-pink/10 border border-neon-pink/30 text-sm text-neon-pink">{{ error }}</div>

    <div v-if="unverified" class="mb-6 px-5 py-4 rounded-xl bg-gold-accent/10 border border-gold-accent/30 text-sm text-gold-accent">
      {{ unverified }} venue{{ unverified === 1 ? ' has' : 's have' }} unverified booking contacts. Artists are shown a warning until someone confirms them.
    </div>

    <form v-if="showForm" class="bg-space-gray rounded-2xl border border-white/10 p-6 mb-8" @submit.prevent="save">
      <h2 class="font-display text-lg font-semibold mb-4">{{ editingId ? 'Edit venue' : 'New venue' }}</h2>
      <div class="grid gap-4 sm:grid-cols-2">
        <label class="block"><span class="block text-sm mb-1.5">Name</span>
          <input v-model="form.name" required class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
        <label class="block"><span class="block text-sm mb-1.5">Type</span>
          <select v-model="form.venueType" class="w-full px-4 py-2.5 bg-space-dark border border-white/10 rounded-xl">
            <option v-for="t in ['club','bar','theater','listening_room','outdoor','diy','restaurant','coffee','arena','record_store','other']" :key="t" :value="t">{{ humanize(t) }}</option>
          </select></label>
        <label class="block sm:col-span-2"><span class="block text-sm mb-1.5">Address</span>
          <input v-model="form.address" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
        <label class="block"><span class="block text-sm mb-1.5">Neighborhood</span>
          <input v-model="form.neighborhood" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
        <label class="block"><span class="block text-sm mb-1.5">Capacity</span>
          <input v-model.number="form.capacity" type="number" min="1" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
        <label class="block sm:col-span-2"><span class="block text-sm mb-1.5">Genres booked <span class="text-text-muted">(comma separated)</span></span>
          <input v-model="form.genresBooked" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>

        <label class="block"><span class="block text-sm mb-1.5">Booking contact</span>
          <input v-model="form.bookingContactName" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
        <label class="block"><span class="block text-sm mb-1.5">Booking email</span>
          <input v-model="form.bookingEmail" type="email" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
        <label class="block"><span class="block text-sm mb-1.5">Booking phone</span>
          <input v-model="form.bookingPhone" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
        <label class="block"><span class="block text-sm mb-1.5">Submission URL</span>
          <input v-model="form.submissionUrl" type="url" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
        <label class="block"><span class="block text-sm mb-1.5">Pay structure</span>
          <select v-model="form.paysArtists" class="w-full px-4 py-2.5 bg-space-dark border border-white/10 rounded-xl">
            <option v-for="pv in ['guarantee','guarantee_plus_split','door_split','ticket_split','tips_only','unpaid','varies']" :key="pv" :value="pv">{{ humanize(pv) }}</option>
          </select></label>
        <label class="block"><span class="block text-sm mb-1.5">Website</span>
          <input v-model="form.websiteUrl" type="url" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
        <label class="block sm:col-span-2"><span class="block text-sm mb-1.5">How to submit</span>
          <textarea v-model="form.submissionNotes" rows="2" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl resize-y" /></label>
        <label class="block sm:col-span-2"><span class="block text-sm mb-1.5">Stage / production notes</span>
          <input v-model="form.stageNotes" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>

        <div class="sm:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <label class="flex items-center gap-2"><input v-model="form.acceptsSubmissions" type="checkbox" class="w-4 h-4 accent-electric-blue"><span class="text-sm">Takes submissions</span></label>
          <label class="flex items-center gap-2"><input v-model="form.allAges" type="checkbox" class="w-4 h-4 accent-electric-blue"><span class="text-sm">All ages</span></label>
          <label class="flex items-center gap-2"><input v-model="form.hasBackline" type="checkbox" class="w-4 h-4 accent-electric-blue"><span class="text-sm">Backline</span></label>
          <label class="flex items-center gap-2"><input v-model="form.hasSoundEngineer" type="checkbox" class="w-4 h-4 accent-electric-blue"><span class="text-sm">Sound engineer</span></label>
          <label class="flex items-center gap-2"><input v-model="form.published" type="checkbox" class="w-4 h-4 accent-electric-blue"><span class="text-sm">Published</span></label>
          <label class="flex items-center gap-2"><input v-model="form.markVerified" type="checkbox" class="w-4 h-4 accent-electric-blue"><span class="text-sm">Mark verified</span></label>
        </div>
      </div>
      <button type="submit" :disabled="busy" class="mt-5 px-6 py-2.5 rounded-full bg-electric-blue text-space-black font-bold text-sm hover:bg-white disabled:opacity-50">
        {{ editingId ? 'Save changes' : 'Add venue' }}
      </button>
    </form>

    <div class="bg-space-gray rounded-2xl border border-white/10 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm min-w-[800px]">
          <thead class="text-xs uppercase tracking-wide text-text-muted border-b border-white/10">
            <tr>
              <th class="text-left py-3 px-5">Venue</th><th class="text-left py-3 px-5">Type</th>
              <th class="text-right py-3 px-5">Cap.</th><th class="text-left py-3 px-5">Submissions</th>
              <th class="text-left py-3 px-5">Pays</th><th class="text-left py-3 px-5">Verified</th>
              <th class="text-left py-3 px-5">State</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr v-for="v in (venues as any[])" :key="v.id">
              <td class="py-3 px-5">
                <div class="font-medium">{{ v.name }}</div>
                <div class="text-xs text-text-muted">{{ v.neighborhood || '—' }}</div>
              </td>
              <td class="py-3 px-5 text-text-secondary">{{ humanize(v.venueType) }}</td>
              <td class="py-3 px-5 text-right tabular-nums text-text-secondary">{{ v.capacity?.toLocaleString() ?? '—' }}</td>
              <td class="py-3 px-5" :class="v.acceptsSubmissions ? 'text-electric-blue' : 'text-text-muted'">{{ v.acceptsSubmissions ? 'Open' : 'Closed' }}</td>
              <td class="py-3 px-5 text-text-secondary">{{ humanize(v.paysArtists) }}</td>
              <td class="py-3 px-5">
                <span v-if="v.verifiedAt" class="text-text-secondary text-xs">{{ formatDate(v.verifiedAt) }}</span>
                <button v-else-if="canEdit" :disabled="busy" class="text-xs text-gold-accent hover:text-white transition-colors disabled:opacity-50"
                  @click="act(() => $fetch(`/api/venues/${v.id}`, { method: 'PATCH', body: { markVerified: true } }))">Mark verified</button>
              </td>
              <td class="py-3 px-5">
                <div class="flex items-center gap-2">
                  <button v-if="canEdit" :disabled="busy" class="px-2.5 py-1 rounded text-xs border transition-colors disabled:opacity-50"
                    :class="v.published ? 'border-electric-blue/40 text-electric-blue' : 'border-white/15 text-text-muted'"
                    @click="act(() => $fetch(`/api/venues/${v.id}`, { method: 'PATCH', body: { published: !v.published } }))">
                    {{ v.published ? 'Live' : 'Draft' }}
                  </button>
                  <button v-if="canEdit" class="text-xs text-electric-blue hover:text-white transition-colors" @click="edit(v)">Edit</button>
                  <button v-if="isOfficer" :disabled="busy" class="text-xs text-text-muted hover:text-neon-pink transition-colors disabled:opacity-50"
                    @click="act(() => $fetch(`/api/venues/${v.id}`, { method: 'DELETE' }))">Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
