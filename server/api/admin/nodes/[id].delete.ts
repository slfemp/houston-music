// Delete a node and everything hanging off it (edges + contact record).
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = getDatabase(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Node id required.' })

  // Explicit cleanup — don't rely on FK cascade behavior.
  await db.batch([
    db.prepare('DELETE FROM edges WHERE from_id = ?1 OR to_id = ?1').bind(id),
    db.prepare('DELETE FROM contacts WHERE node_id = ?1').bind(id),
    db.prepare('DELETE FROM nodes WHERE id = ?1').bind(id),
  ])
  return { ok: true }
})
