import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { agendaItems } from '~~/server/database/schema'

const Body = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  presenterUserId: z.number().int().nullable().optional(),
  minutesAllotted: z.number().int().positive().nullable().optional(),
  actionRequired: z.boolean().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'tabled', 'withdrawn']).optional(),
  notes: z.string().nullable().optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireAgendaAccess(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = Body.parse(await readBody(event))
  const db = useDb()

  const [updated] = await db.update(agendaItems).set(body).where(eq(agendaItems.id, id)).returning()
  if (!updated) throw createError({ statusCode: 404, statusMessage: 'Agenda item not found' })
  await logAction(user.id, 'update', 'agenda_item', id)
  return updated
})
