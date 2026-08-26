// Full network graph for the admin — nodes + edges in one payload.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = getDatabase(event)

  const [nodes, edges] = await Promise.all([
    db.prepare('SELECT id, type, name, data, status, updated_at FROM nodes ORDER BY name').all(),
    db.prepare('SELECT from_id, to_id, relation FROM edges').all(),
  ])

  return {
    nodes: (nodes.results || []).map((n: any) => ({ ...n, data: JSON.parse(n.data || '{}') })),
    edges: edges.results || [],
  }
})
