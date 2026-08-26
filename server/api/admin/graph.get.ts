// Full network graph for the admin — nodes + edges in one payload.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = getDatabase(event)

  const [nodes, edges] = await Promise.all([
    db.prepare('SELECT id, type, name, data, status, updated_at FROM nodes ORDER BY name').all(),
    db.prepare('SELECT from_id, to_id, relation FROM edges').all(),
  ])

  // Per-row parse guard: one malformed data blob must not 500 the whole graph.
  const parse = (s: string) => { try { return JSON.parse(s || '{}') } catch { return {} } }
  return {
    nodes: (nodes.results || []).map((n: any) => ({ ...n, data: parse(n.data) })),
    edges: edges.results || [],
  }
})
