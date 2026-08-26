import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { events, eventRsvps } from '~~/server/database/schema'

const Body = z.object({
  response: z.enum(['yes', 'no', 'maybe']),
  note: z.string().max(500).optional(),
})

/** A board member confirms whether they are attending. Changeable until the event starts. */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const { response, note } = Body.parse(await readBody(event))
  const db = useDb()

  const [row] = await db.select().from(events).where(eq(events.id, id)).limit(1)
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Event not found' })
  if (row.startsAt.getTime() < Date.now()) {
    throw createError({ statusCode: 409, statusMessage: 'This event has already taken place' })
  }
  if (row.rsvpDeadline && row.rsvpDeadline.getTime() < Date.now()) {
    throw createError({ statusCode: 409, statusMessage: 'The RSVP deadline for this event has passed' })
  }

  await db.insert(eventRsvps).values({ eventId: id, userId: user.id, response, note })
    .onConflictDoUpdate({
      target: [eventRsvps.eventId, eventRsvps.userId],
      set: { response, note, respondedAt: new Date() },
    })

  await logAction(user.id, 'rsvp', 'event', id, response)
  return { response }
})
