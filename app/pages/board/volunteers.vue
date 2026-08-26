<script setup lang="ts">
definePageMeta({ layout: 'board', middleware: 'board' })
useHead({ title: 'Volunteers' })

const { canEdit } = useBoardUser()
const { data: opps, refresh: refreshOpps } = await useFetch('/api/volunteer/opportunities', { query: { all: '1' }, default: () => [] })
const { data: signups, refresh: refreshSignups } = await useFetch('/api/volunteer/signups', { default: () => [] })

const error = ref('')
const busy = ref(false)
async function act(fn: () => Promise<unknown>) {
  error.value = ''; busy.value = true
  try { await fn(); await refreshOpps(); await refreshSignups() } catch (e) { error.value = apiError(e) } finally { busy.value = false }
}

const showForm = ref(false)
const form = reactive({
  title: '', description: '', location: '', startsAt: '', endsAt: '',
  slots: null as number | null, skillsWanted: '', contactEmail: '', published: true, closesAt: '',
})

async function create() {
  await act(async () => {
    await $fetch('/api/volunteer/opportunities', {
      method: 'POST',
      body: {
        ...form,
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : undefined,
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
        closesAt: form.closesAt ? new Date(form.closesAt).toISOString() : undefined,
        location: form.location || undefined,
        skillsWanted: form.skillsWanted || undefined,
        contactEmail: form.contactEmail || undefined,
      },
    })
    form.title = ''; form.description = ''; form.location = ''; form.startsAt = ''
    showForm.value = false
  })
}

const selectedOpp = ref<number | null>(null)
const shownSignups = computed(() => {
  const all = signups.value as any[]
  return selectedOpp.value ? all.filter(s => s.opportunityId === selectedOpp.value) : all
})

function exportCsv() {
  const rows = shownSignups.value
  const header = ['Name', 'Email', 'Phone', 'Organization', 'Opportunity', 'Status', 'Signed up', 'Message']
  const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const csv = [
    header.join(','),
    ...rows.map(r => [r.name, r.email, r.phone, r.organization, r.opportunityTitle, r.status, new Date(r.createdAt).toISOString(), r.message].map(esc).join(',')),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `volunteer-signups-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="font-display text-3xl font-bold">Volunteers</h1>
        <p class="text-text-secondary text-sm mt-1">Published opportunities appear at <NuxtLink to="/volunteer" class="text-electric-blue hover:text-white">/volunteer</NuxtLink>.</p>
      </div>
      <button v-if="canEdit" class="px-5 py-2.5 rounded-full bg-electric-blue text-space-black font-bold text-sm hover:bg-white transition-colors" @click="showForm = !showForm">
        {{ showForm ? 'Cancel' : 'New opportunity' }}
      </button>
    </div>

    <div v-if="error" class="mb-6 px-5 py-4 rounded-xl bg-neon-pink/10 border border-neon-pink/30 text-sm text-neon-pink">{{ error }}</div>

    <form v-if="showForm" class="bg-space-gray rounded-2xl border border-white/10 p-6 mb-8" @submit.prevent="create">
      <div class="grid gap-4 sm:grid-cols-2">
        <label class="block sm:col-span-2"><span class="block text-sm mb-1.5">Title</span>
          <input v-model="form.title" required class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
        <label class="block sm:col-span-2"><span class="block text-sm mb-1.5">Description</span>
          <textarea v-model="form.description" required rows="3" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl resize-y" /></label>
        <label class="block"><span class="block text-sm mb-1.5">Starts</span>
          <input v-model="form.startsAt" type="datetime-local" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
        <label class="block"><span class="block text-sm mb-1.5">Ends</span>
          <input v-model="form.endsAt" type="datetime-local" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
        <label class="block sm:col-span-2"><span class="block text-sm mb-1.5">Location</span>
          <input v-model="form.location" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
        <label class="block"><span class="block text-sm mb-1.5">Slots <span class="text-text-muted">(blank = unlimited)</span></span>
          <input v-model.number="form.slots" type="number" min="1" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
        <label class="block"><span class="block text-sm mb-1.5">Sign-ups close</span>
          <input v-model="form.closesAt" type="datetime-local" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
        <label class="block"><span class="block text-sm mb-1.5">Skills wanted</span>
          <input v-model="form.skillsWanted" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
        <label class="block"><span class="block text-sm mb-1.5">Contact email</span>
          <input v-model="form.contactEmail" type="email" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
        <label class="flex items-center gap-3 sm:col-span-2"><input v-model="form.published" type="checkbox" class="w-4 h-4 accent-electric-blue"><span class="text-sm">Publish immediately</span></label>
      </div>
      <button type="submit" :disabled="busy" class="mt-5 px-6 py-2.5 rounded-full bg-electric-blue text-space-black font-bold text-sm hover:bg-white disabled:opacity-50">Create</button>
    </form>

    <div class="grid gap-6 lg:grid-cols-3">
      <section class="lg:col-span-1 bg-space-gray rounded-2xl border border-white/10 p-6 h-fit">
        <h2 class="font-display text-xl font-semibold mb-4">Opportunities</h2>
        <ul v-if="(opps as any[]).length" class="space-y-3">
          <li v-for="o in (opps as any[])" :key="o.id">
            <button class="w-full text-left p-3 rounded-xl border transition-colors"
              :class="selectedOpp === o.id ? 'border-electric-blue/50 bg-electric-blue/5' : 'border-white/10 hover:border-white/25'"
              @click="selectedOpp = selectedOpp === o.id ? null : o.id">
              <div class="flex items-start justify-between gap-2">
                <span class="text-sm font-medium">{{ o.title }}</span>
                <span class="px-2 py-0.5 rounded text-[11px] shrink-0" :class="o.published ? 'bg-electric-blue/15 text-electric-blue' : 'bg-white/5 text-text-muted'">
                  {{ o.published ? 'Live' : 'Draft' }}
                </span>
              </div>
              <p v-if="o.startsAt" class="text-xs text-text-muted mt-1">{{ formatDateTime(o.startsAt) }}</p>
              <p class="text-xs mt-1" :class="o.full ? 'text-neon-pink' : 'text-text-secondary'">
                {{ o.taken }} signed up<template v-if="o.slots"> of {{ o.slots }}</template>
                <template v-if="o.full"> — full, new sign-ups waitlist</template>
              </p>
            </button>
          </li>
        </ul>
        <p v-else class="py-6 text-center text-text-muted text-sm">No opportunities yet.</p>
      </section>

      <section class="lg:col-span-2 bg-space-gray rounded-2xl border border-white/10 p-6">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 class="font-display text-xl font-semibold">
            Sign-ups <span class="text-text-muted font-normal text-base">({{ shownSignups.length }})</span>
          </h2>
          <button v-if="shownSignups.length" class="px-4 py-1.5 rounded-full text-xs border border-white/15 hover:border-electric-blue hover:text-electric-blue transition-colors" @click="exportCsv">
            Export CSV
          </button>
        </div>

        <div v-if="shownSignups.length" class="overflow-x-auto">
          <table class="w-full text-sm min-w-[560px]">
            <thead class="text-xs uppercase tracking-wide text-text-muted border-b border-white/10">
              <tr><th class="text-left py-2 pr-4">Name</th><th class="text-left py-2 pr-4">Contact</th><th class="text-left py-2 pr-4">Opportunity</th><th class="text-left py-2">Status</th></tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr v-for="s in shownSignups" :key="s.id">
                <td class="py-2.5 pr-4">
                  <div class="font-medium">{{ s.name }}</div>
                  <div v-if="s.organization" class="text-xs text-text-muted">{{ s.organization }}</div>
                </td>
                <td class="py-2.5 pr-4 text-text-secondary">
                  <div class="text-xs">{{ s.email }}</div>
                  <div v-if="s.phone" class="text-xs text-text-muted">{{ s.phone }}</div>
                </td>
                <td class="py-2.5 pr-4 text-text-secondary text-xs">{{ s.opportunityTitle }}</td>
                <td class="py-2.5">
                  <span class="px-2 py-0.5 rounded text-[11px] capitalize"
                    :class="{
                      'bg-electric-blue/15 text-electric-blue': s.status === 'confirmed',
                      'bg-gold-accent/15 text-gold-accent': s.status === 'waitlisted',
                      'bg-white/5 text-text-secondary': !['confirmed','waitlisted'].includes(s.status),
                    }">{{ s.status }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="py-8 text-center text-text-muted text-sm">No sign-ups yet.</p>
      </section>
    </div>
  </div>
</template>
