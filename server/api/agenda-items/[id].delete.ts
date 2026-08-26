import { eq } from 'drizzle-orm'
import { agendaItems, motions } from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireAgendaAccess(event)
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()

  // Removing an item that already carries a recorded vote would orphan the
  // record of that decision.
  const attached = await db.select().from(motions).where(eq(motions.agendaItemId, id))
  if (attached.some(m => ['carried', 'failed'].includes(m.status))) {
    throw createError({ statusCode: 409, statusMessage: 'This item has a decided motion on the record and cannot be removed. Mark it withdrawn instead.' })
  }

  await db.delete(agendaItems).where(eq(agendaItems.id, id))
  await logAction(user.id, 'delete', 'agenda_item', id)
  return { ok: true }
})
