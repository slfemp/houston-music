<script setup lang="ts">
definePageMeta({ layout: 'board', middleware: 'board' })
useHead({ title: 'Musicians' })

const { canEdit } = useBoardUser()
const { data: musicians, refresh } = await useFetch('/api/musicians', { default: () => [] })

const error = ref('')
const busy = ref(false)
const filter = ref('pending')

async function act(fn: () => Promise<unknown>) {
  error.value = ''; busy.value = true
  try { await fn(); await refresh() } catch (e) { error.value = apiError(e) } finally { busy.value = false }
}

const counts = computed(() => {
  const all = musicians.value as any[]
  return {
    pending: all.filter(m => m.status === 'pending').length,
    approved: all.filter(m => m.status === 'approved').length,
    rejected: all.filter(m => m.status === 'rejected').length,
  }
})

const shown = computed(() => {
  const all = musicians.value as any[]
  return filter.value === 'all' ? all : all.filter(m => m.status === filter.value)
})
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="font-display text-3xl font-bold">Musicians</h1>
      <p class="text-text-secondary text-sm mt-1">
        Public sign-ups. Nothing appears on <NuxtLink to="/musicians" class="text-electric-blue hover:text-white">/musicians</NuxtLink> until it's approved here.
      </p>
    </div>

    <div v-if="error" class="mb-6 px-5 py-4 rounded-xl bg-neon-pink/10 border border-neon-pink/30 text-sm text-neon-pink">{{ error }}</div>

    <div class="flex flex-wrap gap-2 mb-6">
      <button
        v-for="f in ['pending', 'approved', 'rejected', 'all']" :key="f"
        class="px-4 py-1.5 rounded-full text-sm border capitalize transition-colors"
        :class="filter === f ? 'bg-electric-blue/15 border-electric-blue/40 text-electric-blue' : 'border-white/10 text-text-secondary hover:text-white'"
        @click="filter = f"
      >
        {{ f }}<span v-if="f !== 'all'" class="ml-1.5 text-text-muted">{{ (counts as any)[f] }}</span>
      </button>
    </div>

    <ul v-if="shown.length" class="space-y-3">
      <li v-for="m in shown" :key="m.id" class="bg-space-gray rounded-2xl border border-white/10 p-5"
        :class="m.status === 'pending' ? 'border-gold-accent/30' : ''">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2 mb-1">
              <h3 class="font-semibold">{{ m.stageName || m.name }}</h3>
              <span v-if="m.stageName" class="text-xs text-text-muted">({{ m.name }})</span>
              <span class="px-2 py-0.5 rounded text-[11px] capitalize"
                :class="{
                  'bg-gold-accent/15 text-gold-accent': m.status === 'pending',
                  'bg-electric-blue/15 text-electric-blue': m.status === 'approved',
                  'bg-white/5 text-text-muted': m.status === 'rejected',
                }">{{ m.status }}</span>
              <span v-if="m.status === 'approved' && !m.listed" class="px-2 py-0.5 rounded text-[11px] bg-white/5 text-text-muted">Unlisted by request</span>
            </div>
            <p class="text-xs text-text-muted mb-2">
              {{ humanize(m.actType) }}<template v-if="m.neighborhood"> · {{ m.neighborhood }}</template>
              <template v-if="m.genres"> · {{ m.genres }}</template>
            </p>
            <p v-if="m.bio" class="text-sm text-text-secondary">{{ m.bio }}</p>
            <p class="text-xs text-text-muted mt-2">
              <span class="text-text-secondary">{{ m.email }}</span>
              <template v-if="m.phone"> · {{ m.phone }}</template>
              · submitted {{ formatDate(m.createdAt) }}
            </p>
            <div class="flex flex-wrap gap-3 mt-2">
              <a v-if="m.streamingUrl" :href="m.streamingUrl" target="_blank" rel="noopener" class="text-xs text-electric-blue hover:text-white transition-colors">Listen →</a>
              <a v-if="m.socialUrl" :href="m.socialUrl" target="_blank" rel="noopener" class="text-xs text-electric-blue hover:text-white transition-colors">Social →</a>
              <a v-if="m.pressKitUrl" :href="m.pressKitUrl" target="_blank" rel="noopener" class="text-xs text-electric-blue hover:text-white transition-colors">Press kit →</a>
            </div>
          </div>

          <div v-if="canEdit" class="flex flex-wrap gap-2 shrink-0">
            <button v-if="m.status !== 'approved'" :disabled="busy"
              class="px-4 py-2 rounded-full text-sm bg-electric-blue text-space-black font-bold hover:bg-white transition-colors disabled:opacity-50"
              @click="act(() => $fetch(`/api/musicians/${m.id}`, { method: 'PATCH', body: { status: 'approved' } }))">Approve</button>
            <button v-if="m.status !== 'rejected'" :disabled="busy"
              class="px-4 py-2 rounded-full text-sm border border-white/15 text-text-secondary hover:text-neon-pink hover:border-neon-pink/40 transition-colors disabled:opacity-50"
              @click="act(() => $fetch(`/api/musicians/${m.id}`, { method: 'PATCH', body: { status: 'rejected' } }))">Reject</button>
          </div>
        </div>
      </li>
    </ul>

    <p v-else class="py-12 text-center text-text-muted">No {{ filter }} submissions.</p>
  </div>
</template>
