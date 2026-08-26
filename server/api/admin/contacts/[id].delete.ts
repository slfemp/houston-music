// Delete a contact record (the node itself stays).
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = getDatabase(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Node id required.' })
  await db.prepare('DELETE FROM contacts WHERE node_id = ?').bind(id).run()
  return { ok: true }
})
