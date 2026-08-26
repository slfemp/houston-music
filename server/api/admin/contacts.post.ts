// Create or update the private contact record for a node.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = getDatabase(event)
  const body = await readBody<{ nodeId?: string; emails?: string[]; phones?: string[]; notes?: string }>(event)
  const nodeId = (body.nodeId || '').trim()
  if (!nodeId) throw createError({ statusCode: 400, statusMessage: 'nodeId is required.' })

  const node = await db.prepare('SELECT id FROM nodes WHERE id = ?').bind(nodeId).first()
  if (!node) throw createError({ statusCode: 400, statusMessage: 'No such node.' })

  const clean = (a?: string[]) => JSON.stringify((a || []).map((s) => String(s).trim()).filter(Boolean))
  await db.prepare(
    `INSERT INTO contacts (node_id, emails, phones, notes) VALUES (?1, ?2, ?3, ?4)
     ON CONFLICT(node_id) DO UPDATE SET emails = ?2, phones = ?3, notes = ?4, updated_at = datetime('now')`,
  ).bind(nodeId, clean(body.emails), clean(body.phones), body.notes?.trim() || null).run()
  return { ok: true }
})
