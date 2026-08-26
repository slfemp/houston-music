import { eq, and, gte, lt, desc, asc, sql, inArray } from 'drizzle-orm'
import { events, eventRsvps, users } from '~~/server/database/schema'

/** Board console listing: every event, public and internal, with RSVP counts. */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const db = useDb()
  const { scope = 'upcoming', visibility } = getQuery(event) as { scope?: string, visibility?: string }
  const now = new Date()

  const filters = []
  if (scope === 'upcoming') filters.push(gte(events.startsAt, now))
  if (scope === 'past') filters.push(lt(events.startsAt, now))
  if (visibility) filters.push(eq(events.visibility, visibility as any))

  const rows = await db.select({
    id: events.id, title: events.title, description: events.description,
    category: events.category, visibility: events.visibility, published: events.published,
    startsAt: events.startsAt, endsAt: events.endsAt, allDay: events.allDay,
    location: events.location, virtualUrl: events.virtualUrl, imageUrl: events.imageUrl,
    externalRsvpUrl: events.externalRsvpUrl, rsvpRequired: events.rsvpRequired,
    rsvpDeadline: events.rsvpDeadline, boardRepNote: events.boardRepNote,
    createdAt: events.createdAt,
    yes: sql<number>`(select count(*) from ${eventRsvps} where ${eventRsvps.eventId} = ${events.id} and ${eventRsvps.response} = 'yes')`,
    no: sql<number>`(select count(*) from ${eventRsvps} where ${eventRsvps.eventId} = ${events.id} and ${eventRsvps.response} = 'no')`,
    maybe: sql<number>`(select count(*) from ${eventRsvps} where ${eventRsvps.eventId} = ${events.id} and ${eventRsvps.response} = 'maybe')`,
    myResponse: sql<string | null>`(select ${eventRsvps.response} from ${eventRsvps} where ${eventRsvps.eventId} = ${events.id} and ${eventRsvps.userId} = ${user.id})`,
  }).from(events)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(scope === 'past' ? desc(events.startsAt) : asc(events.startsAt))
    .limit(200)

  return rows.map(r => ({
    ...r,
    yes: Number(r.yes), no: Number(r.no), maybe: Number(r.maybe),
    awaitingMyRsvp: r.rsvpRequired && !r.myResponse && r.startsAt > now,
  }))
})
