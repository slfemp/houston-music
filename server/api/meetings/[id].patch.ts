import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { meetings } from '~~/server/database/schema'

const Body = z.object({
  title: z.string().min(1).optional(),
  type: z.enum(['regular', 'special', 'committee', 'workshop', 'listening_session', 'emergency']).optional(),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().nullable().optional(),
  location: z.string().min(1).optional(),
  virtualUrl: z.string().nullable().optional(),
  status: z.enum(['draft', 'noticed', 'in_progress', 'adjourned', 'cancelled']).optional(),
  minutesBody: z.string().nullable().optional(),
  minutesStatus: z.enum(['none', 'draft', 'submitted', 'approved']).optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireAgendaAccess(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = Body.parse(await readBody(event))
  const db = useDb()

  const [existing] = await db.select().from(meetings).where(eq(meetings.id, id)).limit(1)
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Meeting not found' })

  // Approved minutes are the official record. Changing them requires a motion
  // to amend something previously adopted, not an edit.
  if (existing.minutesStatus === 'approved' && body.minutesBody !== undefined) {
    throw createError({
      statusCode: 409,
      statusMessage: 'These minutes were adopted by the board. Correct them with a motion to amend something previously adopted.',
    })
  }

  const [updated] = await db.update(meetings).set(body).where(eq(meetings.id, id)).returning()
  await logAction(user.id, 'update', 'meeting', id)
  return updated
})
