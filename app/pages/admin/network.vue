<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'HMAB Admin — Network' })

interface GNode { id: string; type: string; name: string; data: Record<string, any>; status: string }
interface GEdge { from_id: string; to_id: string; relation: string }

const { data: graph, refresh } = await useFetch<{ nodes: GNode[]; edges: GEdge[] }>('/api/admin/graph')

const TYPE_META: Record<string, { label: string; color: string }> = {
  person: { label: 'People', color: '#00D9FF' },
  org: { label: 'Organizations', color: '#9D4EDD' },
  venue: { label: 'Venues', color: '#FFB700' },
  event: { label: 'Events', color: '#FF006E' },
  program: { label: 'Programs', color: '#4ade80' },
}

const search = ref('')
const activeType = ref<string | null>(null)
const proposedOnly = ref(false)
const selectedId = ref<string | null>(null)
const busy = ref(false)
const errorMsg = ref('')

const nodes = computed(() => graph.value?.nodes || [])
const byId = computed(() => new Map(nodes.value.map((n) => [n.id, n])))
const proposedCount = computed(() => nodes.value.filter((n) => n.status === 'proposed').length)

const typeCounts = computed(() => {
  const c: Record<string, number> = {}
  for (const n of nodes.value) c[n.type] = (c[n.type] || 0) + 1
  return c
})

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return nodes.value.filter((n) => {
    if (activeType.value && n.type !== activeType.value) return false
    if (proposedOnly.value && n.status !== 'proposed') return false
    if (!q) return true
    return n.name.toLowerCase().includes(q) || JSON.stringify(n.data).toLowerCase().includes(q)
  })
})

const selected = computed(() => (selectedId.value ? byId.value.get(selectedId.value) || null : null))

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
  const skip = new Set(['minimal', 'sweep'])
  const out: [string, string][] = []
  for (const [k, v] of Object.entries(n.data || {})) {
    if (v == null || skip.has(k)) continue
    out.push([k, Array.isArray(v) ? v.join(' · ') : typeof v === 'object' ? JSON.stringify(v) : String(v)])
  }
  return out
}

async function call(fn: () => Promise<unknown>) {
  errorMsg.value = ''
  busy.value = true
  try { await fn(); await refresh() } catch (e: any) { errorMsg.value = e?.data?.statusMessage || 'Request failed.' } finally { busy.value = false }
}

// ── Node editor ───────────────────────────────────────────────────
const editorOpen = ref(false)
const editor = reactive({
  isNew: true, id: '', type: 'venue', name: '', status: 'active',
  description: '', address: '', area: '', website: '', roles: '', notes: '', links: '', aka: '',
  extras: {} as Record<string, any>, // untouched data keys carried through saves
})

const EDITOR_KEYS = ['description', 'address', 'area', 'website', 'roles', 'notes', 'links', 'aka']

function openNew() {
  Object.assign(editor, { isNew: true, id: '', type: activeType.value || 'venue', name: '', status: 'active', description: '', address: '', area: '', website: '', roles: '', notes: '', links: '', aka: '', extras: {} })
  editorOpen.value = true
}

function openEdit(n: GNode) {
  const d = n.data || {}
  const extras: Record<string, any> = {}
  for (const [k, v] of Object.entries(d)) if (!EDITOR_KEYS.includes(k)) extras[k] = v
  Object.assign(editor, {
    isNew: false, id: n.id, type: n.type, name: n.name, status: n.status,
    description: d.description || '', address: d.address || '', area: d.area || '', website: d.website || '',
    roles: Array.isArray(d.roles) ? d.roles.join('\n') : d.roles || '',
    notes: d.notes || '',
    links: Array.isArray(d.links) ? d.links.join('\n') : d.links || '',
    aka: Array.isArray(d.aka) ? d.aka.join(', ') : d.aka || '',
    extras,
  })
  editorOpen.value = true
}

async function saveNode() {
  const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean)
  const data: Record<string, any> = { ...editor.extras }
  if (editor.description.trim()) data.description = editor.description.trim(); else delete data.description
  if (editor.address.trim()) data.address = editor.address.trim(); else delete data.address
  if (editor.area.trim()) data.area = editor.area.trim(); else delete data.area
  if (editor.website.trim()) data.website = editor.website.trim(); else delete data.website
  if (editor.notes.trim()) data.notes = editor.notes.trim(); else delete data.notes
  if (lines(editor.roles).length) data.roles = lines(editor.roles); else delete data.roles
  if (lines(editor.links).length) data.links = lines(editor.links); else delete data.links
  const aka = editor.aka.split(',').map((x) => x.trim()).filter(Boolean)
  if (aka.length) data.aka = aka; else delete data.aka

  const id = editor.isNew
    ? (editor.id.trim() || editor.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    : editor.id
  await call(() => $fetch('/api/admin/nodes', { method: 'POST', body: { id, type: editor.type, name: editor.name.trim(), status: editor.status, data } }))
  if (!errorMsg.value) { editorOpen.value = false; selectedId.value = id }
}

async function setStatus(n: GNode, status: string) {
  await call(() => $fetch('/api/admin/nodes', { method: 'POST', body: { id: n.id, type: n.type, name: n.name, status, data: n.data } }))
}

async function removeNode(n: GNode) {
  if (!confirm(`Delete "${n.name}" and all its connections? This cannot be undone.`)) return
  await call(() => $fetch(`/api/admin/nodes/${n.id}`, { method: 'DELETE' }))
  if (!errorMsg.value && selectedId.value === n.id) selectedId.value = null
}

// ── Connections ───────────────────────────────────────────────────
const newEdgeName = ref('')
const newEdgeRelation = ref('')
async function addEdge() {
  const target = nodes.value.find((n) => n.name === newEdgeName.value)
  if (!target || !selectedId.value) { errorMsg.value = 'Pick a node from the list.'; return }
  await call(() => $fetch('/api/admin/edges', { method: 'POST', body: { from_id: selectedId.value, to_id: target.id, relation: newEdgeRelation.value || 'related-to' } }))
  if (!errorMsg.value) { newEdgeName.value = ''; newEdgeRelation.value = '' }
}
async function removeEdge(c: { node: GNode; relation: string; direction: 'out' | 'in' }) {
  const [from, to] = c.direction === 'out' ? [selectedId.value, c.node.id] : [c.node.id, selectedId.value]
  await call(() => $fetch('/api/admin/edges', { method: 'DELETE', body: { from_id: from, to_id: to, relation: c.relation } }))
}
</script>

<template>
  <div class="flex h-screen">
    <!-- List column -->
    <div class="w-96 shrink-0 border-r border-white/10 flex flex-col">
      <div class="p-4 border-b border-white/10 space-y-3">
        <div class="flex gap-2">
          <input
            v-model="search" type="search" placeholder="Search the network…"
            class="flex-1 bg-space-gray border border-white/15 rounded-lg px-3 py-2 text-sm placeholder:text-text-muted focus:border-electric-blue"
          >
          <button class="px-3 py-2 bg-electric-blue text-space-black font-bold rounded-lg text-sm hover:bg-white transition" @click="openNew">+ New</button>
        </div>
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
          <button
            v-if="proposedCount"
            class="px-2.5 py-1 rounded-full text-xs border transition"
            :class="proposedOnly ? 'border-neon-pink text-neon-pink' : 'border-white/15 text-text-secondary hover:text-white'"
            @click="proposedOnly = !proposedOnly"
          >Proposed {{ proposedCount }}</button>
        </div>
        <p v-if="errorMsg" class="text-neon-pink text-xs">{{ errorMsg }}</p>
      </div>
      <div class="flex-1 overflow-y-auto">
        <button
          v-for="n in filtered" :key="n.id"
          class="w-full text-left px-4 py-2.5 border-b border-white/5 hover:bg-white/5 transition flex items-center gap-3"
          :class="selectedId === n.id ? 'bg-white/10' : ''"
          @click="selectedId = n.id"
        >
          <span class="w-2 h-2 rounded-full shrink-0" :style="{ background: TYPE_META[n.type]?.color || '#888' }" />
          <span class="text-sm truncate flex-1">{{ n.name }}</span>
          <span v-if="n.status === 'proposed'" class="text-[10px] uppercase tracking-wider text-neon-pink">new</span>
        </button>
        <p v-if="!filtered.length" class="p-6 text-sm text-text-muted">No nodes match.</p>
      </div>
    </div>

    <!-- Detail panel -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="!selected" class="h-full flex items-center justify-center text-text-muted text-sm">
        Select a node — or hit + New to add a musician, venue, org, event, or program.
      </div>
      <div v-else class="p-8 max-w-3xl">
        <div class="flex items-center gap-3 mb-1">
          <span class="text-xs uppercase tracking-wider px-2 py-0.5 rounded-full text-space-black font-semibold" :style="{ background: TYPE_META[selected.type]?.color || '#888' }">{{ selected.type }}</span>
          <span v-if="selected.status !== 'active'" class="text-xs uppercase" :class="selected.status === 'proposed' ? 'text-neon-pink' : 'text-text-muted'">{{ selected.status }}</span>
          <span class="flex-1" />
          <button v-if="selected.status === 'proposed'" class="px-3 py-1.5 bg-electric-blue text-space-black text-xs font-bold rounded-full hover:bg-white transition disabled:opacity-50" :disabled="busy" @click="setStatus(selected, 'active')">✓ Approve</button>
          <button class="px-3 py-1.5 bg-white/10 text-xs font-semibold rounded-full hover:bg-white/20 transition disabled:opacity-50" :disabled="busy" @click="openEdit(selected)">Edit</button>
          <button class="px-3 py-1.5 bg-neon-pink/15 text-neon-pink text-xs font-semibold rounded-full hover:bg-neon-pink hover:text-white transition disabled:opacity-50" :disabled="busy" @click="removeNode(selected)">Delete</button>
        </div>
        <h1 class="text-3xl font-bold mb-6">{{ selected.name }}</h1>

        <div class="space-y-4 mb-10">
          <div v-for="[k, v] in detailFields(selected)" :key="k">
            <div class="text-xs uppercase tracking-wider text-text-muted mb-1">{{ k }}</div>
            <div class="text-sm text-text-secondary whitespace-pre-wrap">{{ v }}</div>
          </div>
        </div>

        <h2 class="text-sm uppercase tracking-wider text-text-muted mb-3">Connections ({{ connections.length }})</h2>
        <div class="grid gap-2 sm:grid-cols-2 mb-4">
          <div
            v-for="c in connections" :key="c.node.id + c.relation + c.direction"
            class="bg-space-gray border border-white/10 rounded-lg px-4 py-3 hover:border-electric-blue/60 transition flex items-start gap-2"
          >
            <button class="text-left flex-1 min-w-0" @click="selectedId = c.node.id">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full shrink-0" :style="{ background: TYPE_META[c.node.type]?.color || '#888' }" />
                <span class="text-sm font-medium truncate">{{ c.node.name }}</span>
              </div>
              <div class="text-xs text-text-muted mt-1">{{ c.direction === 'out' ? c.relation : `${c.relation} ←` }}</div>
            </button>
            <button class="text-text-muted hover:text-neon-pink text-lg leading-none" title="Remove connection" :disabled="busy" @click="removeEdge(c)">×</button>
          </div>
        </div>

        <div class="flex flex-wrap gap-2 items-center bg-space-gray border border-white/10 rounded-lg p-3">
          <input v-model="newEdgeName" list="all-nodes" placeholder="Connect to…" class="flex-1 min-w-40 bg-space-black border border-white/15 rounded px-3 py-1.5 text-sm placeholder:text-text-muted focus:border-electric-blue">
          <datalist id="all-nodes">
            <option v-for="n in nodes" :key="n.id" :value="n.name" />
          </datalist>
          <input v-model="newEdgeRelation" placeholder="relation (e.g. member-of)" class="w-48 bg-space-black border border-white/15 rounded px-3 py-1.5 text-sm placeholder:text-text-muted focus:border-electric-blue">
          <button class="px-4 py-1.5 bg-electric-blue text-space-black text-sm font-bold rounded hover:bg-white transition disabled:opacity-50" :disabled="busy" @click="addEdge">Add</button>
        </div>
      </div>
    </div>

    <!-- Editor modal -->
    <div v-if="editorOpen" class="fixed inset-0 z-50 bg-black/70 flex items-start justify-center overflow-y-auto py-10" @click.self="editorOpen = false">
      <div class="bg-space-gray border border-white/15 rounded-2xl w-full max-w-xl p-6 space-y-4">
        <h2 class="text-lg font-bold">{{ editor.isNew ? 'New node' : `Edit: ${editor.name}` }}</h2>
        <div class="grid grid-cols-2 gap-3">
          <label class="block text-xs uppercase tracking-wider text-text-muted">Type
            <select v-model="editor.type" class="mt-1 w-full bg-space-black border border-white/15 rounded px-3 py-2 text-sm text-white">
              <option v-for="(meta, t) in TYPE_META" :key="t" :value="t">{{ meta.label }}</option>
            </select>
          </label>
          <label class="block text-xs uppercase tracking-wider text-text-muted">Status
            <select v-model="editor.status" class="mt-1 w-full bg-space-black border border-white/15 rounded px-3 py-2 text-sm text-white">
              <option value="active">active</option>
              <option value="proposed">proposed</option>
              <option value="archived">archived</option>
            </select>
          </label>
        </div>
        <label class="block text-xs uppercase tracking-wider text-text-muted">Name
          <input v-model="editor.name" class="mt-1 w-full bg-space-black border border-white/15 rounded px-3 py-2 text-sm text-white focus:border-electric-blue">
        </label>
        <label class="block text-xs uppercase tracking-wider text-text-muted">Description
          <textarea v-model="editor.description" rows="3" class="mt-1 w-full bg-space-black border border-white/15 rounded px-3 py-2 text-sm text-white focus:border-electric-blue" />
        </label>
        <div class="grid grid-cols-2 gap-3">
          <label class="block text-xs uppercase tracking-wider text-text-muted">Address
            <input v-model="editor.address" class="mt-1 w-full bg-space-black border border-white/15 rounded px-3 py-2 text-sm text-white">
          </label>
          <label class="block text-xs uppercase tracking-wider text-text-muted">Area / Neighborhood
            <input v-model="editor.area" class="mt-1 w-full bg-space-black border border-white/15 rounded px-3 py-2 text-sm text-white">
          </label>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <label class="block text-xs uppercase tracking-wider text-text-muted">Website
            <input v-model="editor.website" class="mt-1 w-full bg-space-black border border-white/15 rounded px-3 py-2 text-sm text-white">
          </label>
          <label class="block text-xs uppercase tracking-wider text-text-muted">AKA (comma-separated)
            <input v-model="editor.aka" class="mt-1 w-full bg-space-black border border-white/15 rounded px-3 py-2 text-sm text-white">
          </label>
        </div>
        <label class="block text-xs uppercase tracking-wider text-text-muted">Roles (one per line)
          <textarea v-model="editor.roles" rows="2" class="mt-1 w-full bg-space-black border border-white/15 rounded px-3 py-2 text-sm text-white" />
        </label>
        <label class="block text-xs uppercase tracking-wider text-text-muted">Links (one per line)
          <textarea v-model="editor.links" rows="2" class="mt-1 w-full bg-space-black border border-white/15 rounded px-3 py-2 text-sm text-white" />
        </label>
        <label class="block text-xs uppercase tracking-wider text-text-muted">Notes
          <textarea v-model="editor.notes" rows="2" class="mt-1 w-full bg-space-black border border-white/15 rounded px-3 py-2 text-sm text-white" />
        </label>
        <div class="flex justify-end gap-3 pt-2">
          <button class="px-4 py-2 text-sm text-text-secondary hover:text-white transition" @click="editorOpen = false">Cancel</button>
          <button class="px-5 py-2 bg-electric-blue text-space-black text-sm font-bold rounded-lg hover:bg-white transition disabled:opacity-50" :disabled="busy || !editor.name.trim()" @click="saveNode">{{ busy ? 'Saving…' : 'Save' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>
