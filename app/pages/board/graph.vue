<script setup lang="ts">
definePageMeta({ layout: 'board', middleware: 'board' })
useHead({ title: 'HMAB Console — Graph' })

import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, forceX, forceY } from 'd3-force'

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

const canvasEl = ref<HTMLCanvasElement | null>(null)
const wrapEl = ref<HTMLElement | null>(null)
const hiddenTypes = ref<Set<string>>(new Set())
const proposedHidden = ref(true) // 130+ unapproved venues would drown the graph by default
const search = ref('')
const selected = ref<GNode | null>(null)
const hoverName = ref('')

interface SimNode { id: string; type: string; name: string; status: string; degree: number; x?: number; y?: number; fx?: number | null; fy?: number | null }
let sim: ReturnType<typeof forceSimulation> | null = null
let simNodes: SimNode[] = []
let simLinks: { source: any; target: any; relation: string }[] = []
let transform = { x: 0, y: 0, k: 1 }
let raf = 0

const nodeById = computed(() => new Map((graph.value?.nodes || []).map((n) => [n.id, n])))

function visibleData() {
  const nodes = (graph.value?.nodes || []).filter((n) =>
    !hiddenTypes.value.has(n.type) && !(proposedHidden.value && n.status === 'proposed'))
  const ids = new Set(nodes.map((n) => n.id))
  const edges = (graph.value?.edges || []).filter((e) => ids.has(e.from_id) && ids.has(e.to_id))
  const degree = new Map<string, number>()
  for (const e of edges) {
    degree.set(e.from_id, (degree.get(e.from_id) || 0) + 1)
    degree.set(e.to_id, (degree.get(e.to_id) || 0) + 1)
  }
  return {
    nodes: nodes.map((n) => ({ id: n.id, type: n.type, name: n.name, status: n.status, degree: degree.get(n.id) || 0 })),
    links: edges.map((e) => ({ source: e.from_id, target: e.to_id, relation: e.relation })),
  }
}

function radius(n: SimNode) { return 4 + Math.min(14, Math.sqrt(n.degree) * 2.2) }

function rebuild() {
  if (!canvasEl.value) return
  const { nodes, links } = visibleData()
  simNodes = nodes
  simLinks = links as any
  sim?.stop()
  const w = canvasEl.value.width, h = canvasEl.value.height
  sim = forceSimulation(simNodes as any)
    .force('link', forceLink(simLinks as any).id((d: any) => d.id).distance(60).strength(0.4))
    .force('charge', forceManyBody().strength(-120))
    .force('center', forceCenter(w / 2, h / 2))
    .force('collide', forceCollide().radius((d: any) => radius(d) + 2))
    .force('x', forceX(w / 2).strength(0.03))
    .force('y', forceY(h / 2).strength(0.03))
  sim.on('tick', () => { /* draw loop handles rendering */ })
  if (!raf) loop()
}

function draw() {
  const canvas = canvasEl.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.save()
  ctx.translate(transform.x, transform.y)
  ctx.scale(transform.k, transform.k)

  const q = search.value.trim().toLowerCase()
  const selId = selected.value?.id
  const neighbor = new Set<string>()
  if (selId) for (const l of simLinks) {
    const s = (l.source as any).id, t = (l.target as any).id
    if (s === selId) neighbor.add(t)
    if (t === selId) neighbor.add(s)
  }

  ctx.lineWidth = 0.6
  for (const l of simLinks) {
    const s = l.source as any, t = l.target as any
    const active = selId && (s.id === selId || t.id === selId)
    ctx.strokeStyle = active ? 'rgba(0,217,255,0.55)' : 'rgba(255,255,255,0.10)'
    ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(t.x, t.y); ctx.stroke()
  }

  for (const n of simNodes as any[]) {
    const r = radius(n)
    const dim = (selId && n.id !== selId && !neighbor.has(n.id)) || (q && !n.name.toLowerCase().includes(q))
    ctx.globalAlpha = dim ? 0.18 : 1
    ctx.fillStyle = TYPE_META[n.type]?.color || '#888'
    ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2); ctx.fill()
    if (n.id === selId) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke() }
    if (r > 8 || n.id === selId || (q && n.name.toLowerCase().includes(q))) {
      ctx.fillStyle = 'rgba(255,255,255,0.85)'
      ctx.font = `${Math.max(9, 11 / transform.k)}px Inter, sans-serif`
      ctx.fillText(n.name, n.x + r + 3, n.y + 3)
    }
  }
  ctx.globalAlpha = 1
  ctx.restore()
}

function loop() { draw(); raf = requestAnimationFrame(loop) }

function toWorld(px: number, py: number) {
  return { x: (px - transform.x) / transform.k, y: (py - transform.y) / transform.k }
}
function nodeAt(px: number, py: number): SimNode | null {
  const { x, y } = toWorld(px, py)
  for (let i = simNodes.length - 1; i >= 0; i--) {
    const n = simNodes[i] as any
    const r = radius(n) + 2
    if ((n.x - x) ** 2 + (n.y - y) ** 2 < r * r) return n
  }
  return null
}

let dragNode: any = null
let panning = false
let last = { x: 0, y: 0 }

function onDown(e: MouseEvent) {
  const n = nodeAt(e.offsetX, e.offsetY)
  if (n) { dragNode = n; sim?.alphaTarget(0.25).restart() } else { panning = true }
  last = { x: e.offsetX, y: e.offsetY }
}
function onMove(e: MouseEvent) {
  if (dragNode) {
    const p = toWorld(e.offsetX, e.offsetY)
    dragNode.fx = p.x; dragNode.fy = p.y
  } else if (panning) {
    transform.x += e.offsetX - last.x; transform.y += e.offsetY - last.y
    last = { x: e.offsetX, y: e.offsetY }
  } else {
    hoverName.value = nodeAt(e.offsetX, e.offsetY)?.name || ''
  }
}
function onUp(e: MouseEvent) {
  if (dragNode) {
    const moved = Math.abs(e.offsetX - last.x) + Math.abs(e.offsetY - last.y) > 4
    if (!moved) selected.value = nodeById.value.get(dragNode.id) || null
    dragNode.fx = null; dragNode.fy = null
    dragNode = null
    sim?.alphaTarget(0)
  } else if (panning) {
    const moved = Math.abs(e.offsetX - last.x) + Math.abs(e.offsetY - last.y) > 4
    if (!moved) selected.value = null
    panning = false
  }
}
function onWheel(e: WheelEvent) {
  e.preventDefault()
  const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15
  const k = Math.min(6, Math.max(0.15, transform.k * factor))
  // zoom about the cursor
  transform.x = e.offsetX - ((e.offsetX - transform.x) / transform.k) * k
  transform.y = e.offsetY - ((e.offsetY - transform.y) / transform.k) * k
  transform.k = k
}

function toggleType(t: string) {
  const s = new Set(hiddenTypes.value)
  s.has(t) ? s.delete(t) : s.add(t)
  hiddenTypes.value = s
  rebuild()
}

const selectedConnections = computed(() => {
  if (!selected.value || !graph.value) return []
  const id = selected.value.id
  const out: { name: string; relation: string }[] = []
  for (const e of graph.value.edges) {
    if (e.from_id === id) out.push({ name: nodeById.value.get(e.to_id)?.name || e.to_id, relation: e.relation })
    else if (e.to_id === id) out.push({ name: nodeById.value.get(e.from_id)?.name || e.from_id, relation: e.relation })
  }
  return out.slice(0, 12)
})

function focusSearch() {
  const q = search.value.trim().toLowerCase()
  if (!q) return
  const n = (simNodes as any[]).find((x) => x.name.toLowerCase().includes(q))
  if (n && canvasEl.value) {
    transform.k = 1.6
    transform.x = canvasEl.value.width / 2 - n.x * transform.k
    transform.y = canvasEl.value.height / 2 - n.y * transform.k
    selected.value = nodeById.value.get(n.id) || null
  }
}

onMounted(() => {
  const canvas = canvasEl.value!
  const size = () => {
    canvas.width = wrapEl.value!.clientWidth
    canvas.height = wrapEl.value!.clientHeight
    rebuild()
  }
  size()
  window.addEventListener('resize', size)
  onBeforeUnmount(() => {
    window.removeEventListener('resize', size)
    cancelAnimationFrame(raf); raf = 0
    sim?.stop()
  })
})
</script>

<template>
  <div class="h-[calc(100vh-9rem)] flex flex-col -mx-4 sm:-mx-6">
    <div class="px-6 py-3 border-b border-white/10 flex flex-wrap items-center gap-2">
      <h1 class="text-lg font-bold mr-2">Network Graph</h1>
      <button
        v-for="(meta, t) in TYPE_META" :key="t"
        class="px-2.5 py-1 rounded-full text-xs border transition"
        :class="hiddenTypes.has(t as string) ? 'border-white/10 text-text-muted line-through' : 'text-space-black font-semibold'"
        :style="!hiddenTypes.has(t as string) ? { background: meta.color, borderColor: meta.color } : {}"
        @click="toggleType(t as string)"
      >{{ meta.label }}</button>
      <button
        class="px-2.5 py-1 rounded-full text-xs border transition"
        :class="proposedHidden ? 'border-white/10 text-text-muted' : 'border-neon-pink text-neon-pink'"
        @click="proposedHidden = !proposedHidden; rebuild()"
      >{{ proposedHidden ? 'Show proposed' : 'Hiding proposed' }}</button>
      <input
        v-model="search" type="search" placeholder="Find + focus…"
        class="ml-auto w-52 bg-space-gray border border-white/15 rounded-lg px-3 py-1.5 text-sm placeholder:text-text-muted focus:border-electric-blue"
        @keyup.enter="focusSearch"
      >
    </div>

    <div ref="wrapEl" class="flex-1 relative overflow-hidden bg-space-black">
      <canvas
        ref="canvasEl" class="absolute inset-0 cursor-grab active:cursor-grabbing"
        @mousedown="onDown" @mousemove="onMove" @mouseup="onUp" @mouseleave="onUp" @wheel="onWheel"
      />
      <div v-if="hoverName" class="absolute top-3 left-3 text-xs bg-black/70 border border-white/10 rounded px-2 py-1 pointer-events-none">{{ hoverName }}</div>

      <!-- Selection card -->
      <div v-if="selected" class="absolute top-3 right-3 w-72 bg-space-gray/95 backdrop-blur border border-white/15 rounded-xl p-4">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full text-space-black font-semibold" :style="{ background: TYPE_META[selected.type]?.color || '#888' }">{{ selected.type }}</span>
          <button class="ml-auto text-text-muted hover:text-white" @click="selected = null">×</button>
        </div>
        <div class="font-bold mb-1">{{ selected.name }}</div>
        <p v-if="selected.data?.description" class="text-xs text-text-secondary mb-2 line-clamp-4">{{ selected.data.description }}</p>
        <div class="text-[10px] uppercase tracking-wider text-text-muted mb-1">Connections</div>
        <div class="space-y-0.5 max-h-40 overflow-y-auto">
          <div v-for="c in selectedConnections" :key="c.name + c.relation" class="text-xs text-text-secondary truncate">
            {{ c.name }} <span class="text-text-muted">· {{ c.relation }}</span>
          </div>
        </div>
        <NuxtLink :to="'/board/network'" class="inline-block mt-3 text-xs text-electric-blue hover:underline">Open in Network browser →</NuxtLink>
      </div>
    </div>
  </div>
</template>
