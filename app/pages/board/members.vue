<script setup lang="ts">
definePageMeta({ layout: 'board', middleware: 'board' })
useHead({ title: 'Members' })

const { isAdmin } = useBoardUser()
const showPast = ref(false)
const { data: roster, refresh } = await useFetch('/api/members', {
  query: computed(() => (showPast.value ? { includePast: '1' } : {})),
  default: () => ({ members: [], seatedCount: 0, quorum: 0 }),
})

const error = ref('')
const busy = ref(false)
const tempPassword = ref('')

async function act(fn: () => Promise<unknown>) {
  error.value = ''; busy.value = true
  try { await fn(); await refresh() } catch (e) { error.value = apiError(e) } finally { busy.value = false }
}

const showForm = ref(false)
const form = reactive({
  name: '', email: '', role: 'member', position: 'member',
  organization: '', title: '', seatMember: true,
})

async function create() {
  error.value = ''; busy.value = true
  try {
    const res: any = await $fetch('/api/members', { method: 'POST', body: { ...form } })
    tempPassword.value = res.tempPassword ?? ''
    form.name = ''; form.email = ''; form.organization = ''; form.title = ''
    showForm.value = false
    await refresh()
  } catch (e) { error.value = apiError(e) } finally { busy.value = false }
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="font-display text-3xl font-bold">Members</h1>
        <p class="text-text-secondary text-sm mt-1">
          {{ roster.seatedCount }} seated · quorum is {{ roster.quorum }}
        </p>
      </div>
      <button v-if="isAdmin" class="px-5 py-2.5 rounded-full bg-electric-blue text-space-black font-bold text-sm hover:bg-white transition-colors" @click="showForm = !showForm">
        {{ showForm ? 'Cancel' : 'Add member' }}
      </button>
    </div>

    <div v-if="error" class="mb-6 px-5 py-4 rounded-xl bg-neon-pink/10 border border-neon-pink/30 text-sm text-neon-pink">{{ error }}</div>

    <div v-if="tempPassword" class="mb-6 px-5 py-4 rounded-xl bg-gold-accent/10 border border-gold-accent/30">
      <p class="text-sm text-gold-accent font-medium mb-1">Temporary password — shown once</p>
      <code class="text-sm font-mono text-white">{{ tempPassword }}</code>
      <p class="text-xs text-text-muted mt-2">Hand this to the member directly. It is not stored and cannot be shown again.</p>
      <button class="mt-2 text-xs text-gold-accent hover:text-white transition-colors" @click="tempPassword = ''">Dismiss</button>
    </div>

    <form v-if="showForm" class="bg-space-gray rounded-2xl border border-white/10 p-6 mb-8" @submit.prevent="create">
      <div class="grid gap-4 sm:grid-cols-2">
        <label class="block"><span class="block text-sm mb-1.5">Name</span>
          <input v-model="form.name" required class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
        <label class="block"><span class="block text-sm mb-1.5">Email</span>
          <input v-model="form.email" type="email" required class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
        <label class="block"><span class="block text-sm mb-1.5">Access level</span>
          <select v-model="form.role" class="w-full px-4 py-2.5 bg-space-dark border border-white/10 rounded-xl">
            <option value="member">Member — can move, second, vote</option>
            <option value="officer">Officer — runs meetings, records votes</option>
            <option value="staff">Staff — drafts agendas, no vote</option>
            <option value="admin">Admin — full control</option>
          </select></label>
        <label class="block"><span class="block text-sm mb-1.5">Board position</span>
          <select v-model="form.position" class="w-full px-4 py-2.5 bg-space-dark border border-white/10 rounded-xl">
            <option v-for="p in ['chair','vice_chair','secretary','treasurer','member']" :key="p" :value="p">{{ humanize(p) }}</option>
          </select></label>
        <label class="block"><span class="block text-sm mb-1.5">Organization</span>
          <input v-model="form.organization" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
        <label class="block"><span class="block text-sm mb-1.5">Title</span>
          <input v-model="form.title" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
        <label class="flex items-center gap-3 sm:col-span-2">
          <input v-model="form.seatMember" type="checkbox" class="w-4 h-4 accent-electric-blue">
          <span class="text-sm">Give them a seat <span class="text-text-muted">— required to vote; leave off for staff and liaisons</span></span>
        </label>
      </div>
      <button type="submit" :disabled="busy" class="mt-5 px-6 py-2.5 rounded-full bg-electric-blue text-space-black font-bold text-sm hover:bg-white disabled:opacity-50">Create account</button>
    </form>

    <label class="flex items-center gap-2 mb-4 text-sm text-text-secondary">
      <input v-model="showPast" type="checkbox" class="w-4 h-4 accent-electric-blue"> Include past members
    </label>

    <div class="bg-space-gray rounded-2xl border border-white/10 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm min-w-[720px]">
          <thead class="text-xs uppercase tracking-wide text-text-muted border-b border-white/10">
            <tr>
              <th class="text-left py-3 px-5">Seat</th><th class="text-left py-3 px-5">Name</th>
              <th class="text-left py-3 px-5">Position</th><th class="text-left py-3 px-5">Organization</th>
              <th class="text-left py-3 px-5">Access</th><th class="text-left py-3 px-5">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr v-for="m in roster.members" :key="m.id" :class="m.seated ? '' : 'opacity-50'">
              <td class="py-3 px-5 text-text-muted">{{ m.seatNumber ?? '—' }}</td>
              <td class="py-3 px-5">
                <div class="font-medium">{{ m.name }}</div>
                <div class="text-xs text-text-muted">{{ m.email }}</div>
              </td>
              <td class="py-3 px-5 capitalize">{{ humanize(m.position) }}</td>
              <td class="py-3 px-5 text-text-secondary">{{ m.organization || '—' }}</td>
              <td class="py-3 px-5">
                <select v-if="isAdmin" class="px-2 py-1 bg-space-dark border border-white/10 rounded text-xs" :value="m.role"
                  @change="act(() => $fetch(`/api/members/${m.id}`, { method: 'PATCH', body: { role: ($event.target as HTMLSelectElement).value } }))">
                  <option v-for="r in ['member','officer','staff','admin']" :key="r" :value="r">{{ humanize(r) }}</option>
                </select>
                <span v-else class="capitalize">{{ m.role }}</span>
              </td>
              <td class="py-3 px-5">
                <button v-if="isAdmin" :disabled="busy" class="px-2.5 py-1 rounded text-xs border transition-colors disabled:opacity-50"
                  :class="m.seated ? 'border-electric-blue/40 text-electric-blue' : 'border-white/15 text-text-muted'"
                  @click="act(() => $fetch(`/api/members/${m.id}`, { method: 'PATCH', body: { seated: !m.seated } }))">
                  {{ m.seated ? 'Seated' : 'Not seated' }}
                </button>
                <span v-else class="text-xs" :class="m.seated ? 'text-electric-blue' : 'text-text-muted'">{{ m.seated ? 'Seated' : 'Past' }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <p class="text-xs text-text-muted mt-3">Quorum is a majority of seated members. Unseating someone changes the threshold for every future vote.</p>
  </div>
</template>
