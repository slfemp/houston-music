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

  const status = body.status || 'active'
  await db
    .prepare(
      `INSERT INTO nodes (id, type, name, data, status) VALUES (?1, ?2, ?3, ?4, ?5)
       ON CONFLICT(id) DO UPDATE SET
         type = ?2, name = ?3, data = ?4, status = ?5, updated_at = datetime('now')`,
    )
    .bind(id, type, name, JSON.stringify(body.data || {}), status)
    .run()

  // A vetted venue node automatically joins the booking directory (stub row,
  // board fills in booking details). node_id keeps the two in sync.
  if (type === 'venue' && status === 'active') {
    const d = body.data || {}
    await db
      .prepare(
        `INSERT INTO booking_venues (node_id, name, address, neighborhood, venue_type, website_url, published, created_at)
         VALUES (?1, ?2, ?3, ?4, 'club', ?5, 0, unixepoch() * 1000)
         ON CONFLICT(node_id) DO UPDATE SET name = ?2`,
      )
      .bind(id, name, (d as any).address || null, (d as any).area || null, (d as any).website || null)
      .run()
  }

  return { ok: true, id }
})
