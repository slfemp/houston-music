<script setup lang="ts">
definePageMeta({ layout: 'board', middleware: 'board' })
useHead({ title: 'HMAB Console — Graph' })

import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, forceX, forceY } from 'd3-force'
import type { SimulationNodeDatum, SimulationLinkDatum, Simulation } from 'd3-force'

interface GNode { id: string; type: string; name: string; data: Record<string, any>; status: string }
interface GEdge { from_id: string; to_id: string; relation: string }

const { data: graph, error: graphError } = await useFetch<{ nodes: GNode[]; edges: GEdge[] }>('/api/admin/graph')

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

interface SimNode extends SimulationNodeDatum { id: string; type: string; name: string; status: string; degree: number }
interface SimLink extends SimulationLinkDatum<SimNode> { relation: string }

let sim: Simulation<SimNode, SimLink> | null = null
let simNodes: SimNode[] = []
let simLinks: SimLink[] = []
let transform = { x: 0, y: 0, k: 1 }
let raf = 0
let dirty = true // draw only when something actually changed
let dpr = 1
let cssW = 0
let cssH = 0

const nodeById = computed(() => new Map((graph.value?.nodes || []).map((n) => [n.id, n])))

function isVisible(n: { type: string; status: string }) {
  return !hiddenTypes.value.has(n.type) && !(proposedHidden.value && n.status === 'proposed')
}

function visibleData() {
  const nodes = (graph.value?.nodes || []).filter(isVisible)
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

// Rebuilds the simulation, REUSING existing positions by id so a filter toggle
// or resize adjusts the layout instead of exploding it from scratch.
function rebuild(alpha = 0.3) {
  if (!canvasEl.value) return
  const prev = new Map(simNodes.map((n) => [n.id, n]))
  const { nodes, links } = visibleData()
  simNodes = nodes.map((n) => {
    const p = prev.get(n.id)
    return p ? Object.assign(n as SimNode, { x: p.x, y: p.y, vx: p.vx, vy: p.vy }) : (n as SimNode)
  })
  simLinks = links as unknown as SimLink[]

  // A selection that filtering just removed would ghost-dim the whole canvas.
  if (selected.value && !simNodes.some((n) => n.id === selected.value!.id)) selected.value = null

  sim?.stop()
  sim = forceSimulation<SimNode>(simNodes)
    .force('link', forceLink<SimNode, SimLink>(simLinks).id((d) => d.id).distance(60).strength(0.4))
    .force('charge', forceManyBody().strength(-120))
    .force('center', forceCenter(cssW / 2, cssH / 2))
    .force('collide', forceCollide<SimNode>().radius((d) => radius(d) + 2))
    .force('x', forceX(cssW / 2).strength(0.03))
    .force('y', forceY(cssH / 2).strength(0.03))
    .alpha(alpha)
  sim.on('tick', () => { dirty = true })
  dirty = true
  if (!raf) loop()
}

function draw() {
  const canvas = canvasEl.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')!
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0) // HiDPI: backing store is dpr-scaled, math stays in CSS px
  ctx.clearRect(0, 0, cssW, cssH)
  ctx.save()
  ctx.translate(transform.x, transform.y)
  ctx.scale(transform.k, transform.k)

  const q = search.value.trim().toLowerCase()
  const selId = selected.value?.id
  const neighbor = new Set<string>()
  if (selId) for (const l of simLinks) {
    const s = (l.source as SimNode).id, t = (l.target as SimNode).id
    if (s === selId) neighbor.add(t)
    if (t === selId) neighbor.add(s)
  }

  ctx.lineWidth = 0.6
  for (const l of simLinks) {
    const s = l.source as SimNode, t = l.target as SimNode
    const active = selId && (s.id === selId || t.id === selId)
    ctx.strokeStyle = active ? 'rgba(0,217,255,0.55)' : 'rgba(255,255,255,0.10)'
    ctx.beginPath(); ctx.moveTo(s.x!, s.y!); ctx.lineTo(t.x!, t.y!); ctx.stroke()
  }

  // Label size: constant ~11 SCREEN px when zoomed in, shrinking when zoomed out.
  const fontWorld = Math.min(12, 11 / transform.k)
  ctx.font = `${fontWorld}px Inter, sans-serif`
  for (const n of simNodes) {
    const r = radius(n)
    const nameLower = n.name.toLowerCase()
    const dim = (selId && n.id !== selId && !neighbor.has(n.id)) || (q && !nameLower.includes(q))
    ctx.globalAlpha = dim ? 0.18 : 1
    ctx.fillStyle = TYPE_META[n.type]?.color || '#888'
    ctx.beginPath(); ctx.arc(n.x!, n.y!, r, 0, Math.PI * 2); ctx.fill()
    if (n.id === selId) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke() }
    if (r > 8 || n.id === selId || (q && nameLower.includes(q))) {
      ctx.fillStyle = 'rgba(255,255,255,0.85)'
      ctx.fillText(n.name, n.x! + r + 3, n.y! + 3)
    }
  }
  ctx.globalAlpha = 1
  ctx.restore()
}

// rAF loop with a dirty flag — identical frames are never repainted, so a
// settled graph costs nothing in a background tab.
function loop() {
  if (dirty) { dirty = false; draw() }
  raf = requestAnimationFrame(loop)
}

function toWorld(px: number, py: number) {
  return { x: (px - transform.x) / transform.k, y: (py - transform.y) / transform.k }
}
function nodeAt(px: number, py: number): SimNode | null {
  const { x, y } = toWorld(px, py)
  for (let i = simNodes.length - 1; i >= 0; i--) {
    const n = simNodes[i]
    const r = radius(n) + 2
    if ((n.x! - x) ** 2 + (n.y! - y) ** 2 < r * r) return n
  }
  return null
}

let dragNode: SimNode | null = null
let dragHeated = false
let panning = false
let last = { x: 0, y: 0 }
let downAt = { x: 0, y: 0 } // where the gesture started — `last` moves during pans

function onDown(e: MouseEvent) {
  const n = nodeAt(e.offsetX, e.offsetY)
  if (n) { dragNode = n; dragHeated = false } else { panning = true }
  last = { x: e.offsetX, y: e.offsetY }
  downAt = { x: e.offsetX, y: e.offsetY }
}
function onMove(e: MouseEvent) {
  if (dragNode) {
    // Reheat only once real movement starts — a plain click must not stir the layout.
    if (!dragHeated) { dragHeated = true; sim?.alphaTarget(0.25).restart() }
    const p = toWorld(e.offsetX, e.offsetY)
    dragNode.fx = p.x; dragNode.fy = p.y
    dirty = true
  } else if (panning) {
    transform.x += e.offsetX - last.x; transform.y += e.offsetY - last.y
    last = { x: e.offsetX, y: e.offsetY }
    dirty = true
  } else {
    const name = nodeAt(e.offsetX, e.offsetY)?.name || ''
    if (name !== hoverName.value) hoverName.value = name
  }
}
function onUp(e: MouseEvent) {
  const moved = Math.abs(e.offsetX - downAt.x) + Math.abs(e.offsetY - downAt.y) > 4
  if (dragNode) {
    if (!moved) selected.value = nodeById.value.get(dragNode.id) || null
    dragNode.fx = null; dragNode.fy = null
    dragNode = null
    if (dragHeated) sim?.alphaTarget(0)
    dirty = true
  } else if (panning) {
    if (!moved) selected.value = null
    panning = false
    dirty = true
  }
}
function onWheel(e: WheelEvent) {
  e.preventDefault()
  const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15
  const k = Math.min(6, Math.max(0.15, transform.k * factor))
  transform.x = e.offsetX - ((e.offsetX - transform.x) / transform.k) * k
  transform.y = e.offsetY - ((e.offsetY - transform.y) / transform.k) * k
  transform.k = k
  dirty = true
}

function toggleType(t: string) {
  const s = new Set(hiddenTypes.value)
  s.has(t) ? s.delete(t) : s.add(t)
  hiddenTypes.value = s
  rebuild()
}

watch([search, selected], () => { dirty = true })

// Connections card honors the same visibility filters as the canvas, drops
// dangling edges, and says how many more it is not showing.
const CONNECTION_LIMIT = 12
const selectedConnectionsAll = computed(() => {
  if (!selected.value || !graph.value) return []
  const id = selected.value.id
  const out: { name: string; relation: string }[] = []
  for (const e of graph.value.edges) {
    const otherId = e.from_id === id ? e.to_id : e.to_id === id ? e.from_id : null
    if (!otherId) continue
    const other = nodeById.value.get(otherId)
    if (!other || !isVisible(other)) continue
    out.push({ name: other.name, relation: e.relation })
  }
  return out
})
const selectedConnections = computed(() => selectedConnectionsAll.value.slice(0, CONNECTION_LIMIT))
const connectionsOverflow = computed(() => Math.max(0, selectedConnectionsAll.value.length - CONNECTION_LIMIT))

function focusSearch() {
  const q = search.value.trim().toLowerCase()
  if (!q) return
  const n = simNodes.find((x) => x.name.toLowerCase().includes(q))
  if (n) {
    transform.k = 1.6
    transform.x = cssW / 2 - n.x! * transform.k
    transform.y = cssH / 2 - n.y! * transform.k
    selected.value = nodeById.value.get(n.id) || null
    dirty = true
  }
}

let resizeTimer: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  const canvas = canvasEl.value!
  const size = (full = false) => {
    dpr = window.devicePixelRatio || 1
    cssW = wrapEl.value!.clientWidth
    cssH = wrapEl.value!.clientHeight
    canvas.width = Math.round(cssW * dpr)
    canvas.height = Math.round(cssH * dpr)
    canvas.style.width = cssW + 'px'
    canvas.style.height = cssH + 'px'
    rebuild(full ? 0.6 : 0.15)
  }
  size(true)
  const onResize = () => {
    // Debounced: dragging the window edge must not rebuild dozens of times.
    if (resizeTimer) clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => size(false), 150)
  }
  window.addEventListener('resize', onResize)
  onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize)
    if (resizeTimer) clearTimeout(resizeTimer)
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
      <div v-if="graphError" class="absolute inset-0 flex items-center justify-center">
        <p class="text-neon-pink text-sm">Couldn't load the network graph — {{ graphError.statusMessage || 'try reloading' }}.</p>
      </div>
      <div v-else-if="!(graph?.nodes || []).length" class="absolute inset-0 flex items-center justify-center">
        <p class="text-text-muted text-sm">The network is empty — add nodes in the Network tab.</p>
      </div>
      <template v-else>
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
            <div v-if="connectionsOverflow" class="text-xs text-text-muted">+{{ connectionsOverflow }} more — open in Network</div>
          </div>
          <NuxtLink :to="'/board/network'" class="inline-block mt-3 text-xs text-electric-blue hover:underline">Open in Network browser →</NuxtLink>
        </div>
      </template>
    </div>
  </div>
</template>
