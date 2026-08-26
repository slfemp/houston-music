import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { agendaItems } from '~~/server/database/schema'
import { POSITION_STEP } from '~~/server/utils/agenda'

const Body = z.object({ orderedIds: z.array(z.number().int()).min(1) })

export default defineEventHandler(async (event) => {
  const user = await requireAgendaAccess(event)
  const meetingId = Number(getRouterParam(event, 'id'))
  const { orderedIds } = Body.parse(await readBody(event))
  const db = useDb()

  const items = await db.select().from(agendaItems).where(eq(agendaItems.meetingId, meetingId))
  const known = new Set(items.map(i => i.id))
  if (orderedIds.length !== items.length || orderedIds.some(id => !known.has(id))) {
    throw createError({ statusCode: 422, statusMessage: 'orderedIds must list every item on this agenda exactly once' })
  }

  await Promise.all(orderedIds.map((id, i) =>
    db.update(agendaItems).set({ position: (i + 1) * POSITION_STEP }).where(eq(agendaItems.id, id))))

  await logAction(user.id, 'reorder_agenda', 'meeting', meetingId)
  return { ok: true }
})
