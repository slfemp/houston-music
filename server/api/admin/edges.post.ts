// Create a connection between two nodes.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = getDatabase(event)
  const body = await readBody<{ from_id?: string; to_id?: string; relation?: string }>(event)
  const from = (body.from_id || '').trim()
  const to = (body.to_id || '').trim()
  const relation = (body.relation || '').trim().toLowerCase().replace(/\s+/g, '-')
  if (!from || !to || !relation) throw createError({ statusCode: 400, statusMessage: 'from_id, to_id, and relation are required.' })
  if (from === to) throw createError({ statusCode: 400, statusMessage: 'A node cannot connect to itself.' })

  const exists = await db.prepare('SELECT COUNT(*) c FROM nodes WHERE id IN (?1, ?2)').bind(from, to).first<{ c: number }>()
  if ((exists?.c ?? 0) < 2) throw createError({ statusCode: 400, statusMessage: 'Both nodes must exist.' })

  await db.prepare('INSERT OR IGNORE INTO edges (from_id, to_id, relation) VALUES (?, ?, ?)').bind(from, to, relation).run()
  return { ok: true }
})
