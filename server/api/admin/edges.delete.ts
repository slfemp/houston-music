// Remove a connection.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = getDatabase(event)
  const body = await readBody<{ from_id?: string; to_id?: string; relation?: string }>(event)
  if (!body.from_id || !body.to_id || !body.relation) {
    throw createError({ statusCode: 400, statusMessage: 'from_id, to_id, and relation are required.' })
  }
  await db.prepare('DELETE FROM edges WHERE from_id = ? AND to_id = ? AND relation = ?')
    .bind(body.from_id, body.to_id, body.relation).run()
  return { ok: true }
})
