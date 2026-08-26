import { eq, and, desc } from 'drizzle-orm'
import { events, eventRsvps, users, members } from '~~/server/database/schema'

/** Who is going, and which seated members have not answered yet. */
export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()

  const [row] = await db.select().from(events).where(eq(events.id, id)).limit(1)
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Event not found' })

  const responses = await db.select({
    userId: eventRsvps.userId, name: users.name, response: eventRsvps.response,
    note: eventRsvps.note, respondedAt: eventRsvps.respondedAt,
    position: members.position,
  }).from(eventRsvps)
    .innerJoin(users, eq(eventRsvps.userId, users.id))
    .leftJoin(members, and(eq(members.userId, users.id), eq(members.seated, true)))
    .where(eq(eventRsvps.eventId, id))
    .orderBy(desc(eventRsvps.respondedAt))

  const seated = await db.select({ userId: members.userId, name: users.name, position: members.position })
    .from(members).innerJoin(users, eq(members.userId, users.id))
    .where(eq(members.seated, true))

  const answered = new Set(responses.map(r => r.userId))

  return {
    event: { id: row.id, title: row.title, startsAt: row.startsAt, rsvpRequired: row.rsvpRequired },
    responses,
    counts: {
      yes: responses.filter(r => r.response === 'yes').length,
      no: responses.filter(r => r.response === 'no').length,
      maybe: responses.filter(r => r.response === 'maybe').length,
    },
    awaiting: seated.filter(s => !answered.has(s.userId)),
  }
})
