<script setup lang="ts">
definePageMeta({ layout: 'board', middleware: 'board' })
useHead({ title: 'Issues' })

const { canEdit } = useBoardUser()
const { data: issues, refresh } = await useFetch('/api/issues', { default: () => [] })
const { data: meetings } = await useFetch('/api/meetings', { query: { scope: 'upcoming' }, default: () => [] })

const error = ref('')
const busy = ref(false)
const filter = ref('open')

async function act(fn: () => Promise<unknown>) {
  error.value = ''; busy.value = true
  try { await fn(); await refresh() } catch (e) { error.value = apiError(e) } finally { busy.value = false }
}

const shown = computed(() => {
  const all = issues.value as any[]
  if (filter.value === 'open') return all.filter(i => ['submitted', 'under_review'].includes(i.status))
  if (filter.value === 'scheduled') return all.filter(i => i.status === 'scheduled')
  if (filter.value === 'closed') return all.filter(i => ['resolved', 'rejected', 'deferred'].includes(i.status))
  return all
})

const showForm = ref(false)
const form = reactive({ title: '', description: '', category: 'other', priority: 'normal' })

async function create() {
  await act(async () => {
    await $fetch('/api/issues', { method: 'POST', body: { ...form } })
    form.title = ''; form.description = ''
    showForm.value = false
  })
}

/** Places an issue on an upcoming agenda as a New Business item. */
async function schedule(issue: any, meetingId: number) {
  if (!meetingId) return
  await act(() => $fetch(`/api/meetings/${meetingId}/agenda`, {
    method: 'POST',
    body: { kind: 'new_business', title: issue.title, description: issue.description, issueId: issue.id, actionRequired: true },
  }))
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="font-display text-3xl font-bold">Issues</h1>
        <p class="text-text-secondary text-sm mt-1">The backlog that feeds meeting agendas. Support ranks priority; it is not a binding vote.</p>
      </div>
      <button class="px-5 py-2.5 rounded-full bg-electric-blue text-space-black font-bold text-sm hover:bg-white transition-colors" @click="showForm = !showForm">
        {{ showForm ? 'Cancel' : 'Raise an issue' }}
      </button>
    </div>

    <div v-if="error" class="mb-6 px-5 py-4 rounded-xl bg-neon-pink/10 border border-neon-pink/30 text-sm text-neon-pink">{{ error }}</div>

    <form v-if="showForm" class="bg-space-gray rounded-2xl border border-white/10 p-6 mb-8" @submit.prevent="create">
      <div class="grid gap-4 sm:grid-cols-2">
        <label class="block sm:col-span-2">
          <span class="block text-sm font-medium mb-1.5">Title</span>
          <input v-model="form.title" required minlength="3" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-hidden focus:border-electric-blue">
        </label>
        <label class="block sm:col-span-2">
          <span class="block text-sm font-medium mb-1.5">Description</span>
          <textarea v-model="form.description" required minlength="10" rows="3" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl resize-y focus:outline-hidden focus:border-electric-blue" />
        </label>
        <label class="block">
          <span class="block text-sm font-medium mb-1.5">Category</span>
          <select v-model="form.category" class="w-full px-4 py-2.5 bg-space-dark border border-white/10 rounded-xl">
            <option v-for="c in ['venues','funding','policy','education','events','advocacy','internal','other']" :key="c" :value="c">{{ humanize(c) }}</option>
          </select>
        </label>
        <label class="block">
          <span class="block text-sm font-medium mb-1.5">Priority</span>
          <select v-model="form.priority" class="w-full px-4 py-2.5 bg-space-dark border border-white/10 rounded-xl">
            <option v-for="p in ['low','normal','high','urgent']" :key="p" :value="p">{{ humanize(p) }}</option>
          </select>
        </label>
      </div>
      <button type="submit" :disabled="busy" class="mt-5 px-6 py-2.5 rounded-full bg-electric-blue text-space-black font-bold text-sm hover:bg-white transition-colors disabled:opacity-50">Submit</button>
    </form>

    <div class="flex flex-wrap gap-2 mb-6">
      <button v-for="f in ['open','scheduled','closed','all']" :key="f"
        class="px-4 py-1.5 rounded-full text-sm border capitalize transition-colors"
        :class="filter === f ? 'bg-electric-blue/15 border-electric-blue/40 text-electric-blue' : 'border-white/10 text-text-secondary hover:text-white'"
        @click="filter = f">{{ f }}</button>
    </div>

    <ul v-if="shown.length" class="space-y-3">
      <li v-for="issue in shown" :key="issue.id" class="bg-space-gray rounded-2xl border border-white/10 p-5">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2 mb-1">
              <h3 class="font-semibold">{{ issue.title }}</h3>
              <span class="px-2 py-0.5 rounded text-[11px] capitalize"
                :class="{
                  'bg-neon-pink/15 text-neon-pink': issue.priority === 'urgent',
                  'bg-gold-accent/15 text-gold-accent': issue.priority === 'high',
                  'bg-white/5 text-text-secondary': ['normal','low'].includes(issue.priority),
                }">{{ issue.priority }}</span>
              <span class="px-2 py-0.5 rounded text-[11px] bg-white/5 text-text-secondary capitalize">{{ humanize(issue.status) }}</span>
            </div>
            <p class="text-sm text-text-secondary">{{ issue.description }}</p>
            <p class="text-xs text-text-muted mt-2">
              {{ humanize(issue.category) }} ·
              {{ issue.submittedBy || issue.submitterName || 'Public submission' }} ·
              {{ formatDate(issue.createdAt) }}
            </p>
          </div>

          <div class="flex flex-col items-end gap-2 shrink-0">
            <button :disabled="busy"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors disabled:opacity-50"
              :class="issue.mySupport ? 'bg-electric-blue/15 border-electric-blue/40 text-electric-blue' : 'border-white/15 text-text-secondary hover:text-white'"
              @click="act(() => $fetch(`/api/issues/${issue.id}/support`, { method: 'POST' }))">
              ▲ {{ issue.support }}
            </button>
          </div>
        </div>

        <div v-if="canEdit" class="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-2 items-center">
          <select class="px-3 py-1.5 bg-space-dark border border-white/10 rounded-lg text-xs"
            :value="issue.status"
            @change="act(() => $fetch(`/api/issues/${issue.id}`, { method: 'PATCH', body: { status: ($event.target as HTMLSelectElement).value } }))">
            <option v-for="s in ['submitted','under_review','scheduled','resolved','rejected','deferred']" :key="s" :value="s">{{ humanize(s) }}</option>
          </select>

          <select v-if="(meetings as any[]).length" class="px-3 py-1.5 bg-space-dark border border-white/10 rounded-lg text-xs" @change="schedule(issue, Number(($event.target as HTMLSelectElement).value))">
            <option value="">Add to agenda…</option>
            <option v-for="m in (meetings as any[])" :key="m.id" :value="m.id">{{ m.title }} — {{ formatDate(m.startsAt) }}</option>
          </select>
        </div>
      </li>
    </ul>

    <p v-else class="py-12 text-center text-text-muted">No {{ filter }} issues.</p>
  </div>
</template>
