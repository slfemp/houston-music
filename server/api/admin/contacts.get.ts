// Private contact directory — admin eyes only.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = getDatabase(event)

  const rows = await db
    .prepare(
      `SELECT c.node_id, n.name, n.type, c.emails, c.phones, c.notes
         FROM contacts c JOIN nodes n ON n.id = c.node_id
        ORDER BY n.name`,
    )
    .all()

  return {
    contacts: (rows.results || []).map((r: any) => ({
      nodeId: r.node_id,
      name: r.name,
      type: r.type,
      emails: JSON.parse(r.emails || '[]'),
      phones: JSON.parse(r.phones || '[]'),
      notes: r.notes,
    })),
  }
})
