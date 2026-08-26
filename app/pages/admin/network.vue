<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'HMAB Admin — Network' })

interface GNode { id: string; type: string; name: string; data: Record<string, any>; status: string }
interface GEdge { from_id: string; to_id: string; relation: string }

const { data: graph } = await useFetch<{ nodes: GNode[]; edges: GEdge[] }>('/api/admin/graph')

const TYPE_META: Record<string, { label: string; color: string }> = {
  person: { label: 'People', color: '#00D9FF' },
  org: { label: 'Organizations', color: '#9D4EDD' },
  venue: { label: 'Venues', color: '#FFB700' },
  event: { label: 'Events', color: '#FF006E' },
  program: { label: 'Programs', color: '#4ade80' },
}

const search = ref('')
const activeType = ref<string | null>(null)
const selectedId = ref<string | null>(null)

const nodes = computed(() => graph.value?.nodes || [])
const byId = computed(() => new Map(nodes.value.map((n) => [n.id, n])))

const typeCounts = computed(() => {
  const c: Record<string, number> = {}
  for (const n of nodes.value) c[n.type] = (c[n.type] || 0) + 1
  return c
})

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return nodes.value.filter((n) => {
    if (activeType.value && n.type !== activeType.value) return false
    if (!q) return true
    return n.name.toLowerCase().includes(q) || JSON.stringify(n.data).toLowerCase().includes(q)
  })
})

const selected = computed(() => (selectedId.value ? byId.value.get(selectedId.value) || null : null))

// Every edge touching the selected node, resolved to the node on the other end.
const connections = computed(() => {
  if (!selectedId.value || !graph.value) return []
  const out: { node: GNode; relation: string; direction: 'out' | 'in' }[] = []
  for (const e of graph.value.edges) {
    if (e.from_id === selectedId.value) {
      const n = byId.value.get(e.to_id)
      if (n) out.push({ node: n, relation: e.relation, direction: 'out' })
    } else if (e.to_id === selectedId.value) {
      const n = byId.value.get(e.from_id)
      if (n) out.push({ node: n, relation: e.relation, direction: 'in' })
    }
  }
  return out.sort((a, b) => a.node.type.localeCompare(b.node.type) || a.node.name.localeCompare(b.node.name))
})

function detailFields(n: GNode): [string, string][] {
  const skip = new Set(['minimal'])
  const out: [string, string][] = []
  for (const [k, v] of Object.entries(n.data || {})) {
    if (v == null || skip.has(k)) continue
    out.push([k, Array.isArray(v) ? v.join(' · ') : String(v)])
  }
  return out
}
</script>

<template>
  <div class="flex h-screen">
    <!-- List column -->
    <div class="w-96 shrink-0 border-r border-white/10 flex flex-col">
      <div class="p-4 border-b border-white/10 space-y-3">
        <input
          v-model="search" type="search" placeholder="Search the network…"
          class="w-full bg-space-gray border border-white/15 rounded-lg px-3 py-2 text-sm placeholder:text-text-muted focus:border-electric-blue"
        >
        <div class="flex flex-wrap gap-1.5">
          <button
            class="px-2.5 py-1 rounded-full text-xs border transition"
            :class="activeType === null ? 'border-electric-blue text-electric-blue' : 'border-white/15 text-text-secondary hover:text-white'"
            @click="activeType = null"
          >All {{ nodes.length }}</button>
          <button
            v-for="(meta, t) in TYPE_META" :key="t"
            class="px-2.5 py-1 rounded-full text-xs border transition"
            :class="activeType === t ? 'text-space-black font-semibold' : 'border-white/15 text-text-secondary hover:text-white'"
            :style="activeType === t ? { background: meta.color, borderColor: meta.color } : {}"
            @click="activeType = activeType === t ? null : (t as string)"
          >{{ meta.label }} {{ typeCounts[t] || 0 }}</button>
        </div>
      </div>
      <div class="flex-1 overflow-y-auto">
        <button
          v-for="n in filtered" :key="n.id"
          class="w-full text-left px-4 py-2.5 border-b border-white/5 hover:bg-white/5 transition flex items-center gap-3"
          :class="selectedId === n.id ? 'bg-white/10' : ''"
          @click="selectedId = n.id"
        >
          <span class="w-2 h-2 rounded-full shrink-0" :style="{ background: TYPE_META[n.type]?.color || '#888' }" />
          <span class="text-sm truncate">{{ n.name }}</span>
        </button>
        <p v-if="!filtered.length" class="p-6 text-sm text-text-muted">No nodes match.</p>
      </div>
    </div>

    <!-- Detail panel -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="!selected" class="h-full flex items-center justify-center text-text-muted text-sm">
        Select a node — every musician, venue, org, event, and program in the Houston music network.
      </div>
      <div v-else class="p-8 max-w-3xl">
        <div class="flex items-center gap-3 mb-1">
          <span class="text-xs uppercase tracking-wider px-2 py-0.5 rounded-full text-space-black font-semibold" :style="{ background: TYPE_META[selected.type]?.color || '#888' }">{{ selected.type }}</span>
          <span v-if="selected.status !== 'active'" class="text-xs text-text-muted uppercase">{{ selected.status }}</span>
        </div>
        <h1 class="text-3xl font-bold mb-6">{{ selected.name }}</h1>

        <div class="space-y-4 mb-10">
          <div v-for="[k, v] in detailFields(selected)" :key="k">
            <div class="text-xs uppercase tracking-wider text-text-muted mb-1">{{ k }}</div>
            <div class="text-sm text-text-secondary whitespace-pre-wrap">{{ v }}</div>
          </div>
        </div>

        <h2 class="text-sm uppercase tracking-wider text-text-muted mb-3">Connections ({{ connections.length }})</h2>
        <div class="grid gap-2 sm:grid-cols-2">
          <button
            v-for="c in connections" :key="c.node.id + c.relation + c.direction"
            class="text-left bg-space-gray border border-white/10 rounded-lg px-4 py-3 hover:border-electric-blue/60 transition"
            @click="selectedId = c.node.id"
          >
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full shrink-0" :style="{ background: TYPE_META[c.node.type]?.color || '#888' }" />
              <span class="text-sm font-medium truncate">{{ c.node.name }}</span>
            </div>
            <div class="text-xs text-text-muted mt-1">{{ c.direction === 'out' ? c.relation : `${c.relation} ←` }}</div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
