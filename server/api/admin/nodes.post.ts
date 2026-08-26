// Create or update a node (upsert by id). Phase-1 light CRUD.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = getDatabase(event)

  const body = await readBody<{ id?: string; type?: string; name?: string; data?: Record<string, unknown>; status?: string }>(event)
  const id = (body.id || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const type = (body.type || '').trim()
  const name = (body.name || '').trim()
  if (!id || !type || !name) {
    throw createError({ statusCode: 400, statusMessage: 'id, type, and name are required.' })
  }

  await db
    .prepare(
      `INSERT INTO nodes (id, type, name, data, status) VALUES (?1, ?2, ?3, ?4, ?5)
       ON CONFLICT(id) DO UPDATE SET
         type = ?2, name = ?3, data = ?4, status = ?5, updated_at = datetime('now')`,
    )
    .bind(id, type, name, JSON.stringify(body.data || {}), body.status || 'active')
    .run()

  return { ok: true, id }
})
