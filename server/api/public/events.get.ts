import { eq, and, gte, desc, asc } from 'drizzle-orm'
import { events } from '~~/server/database/schema'

/**
 * Public event feed. Only published, public-visibility events - board-only
 * events are filtered in the query, never merely hidden in the UI.
 */
export default defineEventHandler(async () => {
  const db = useDb()
  const now = new Date()

  const rows = await db.select({
    id: events.id, title: events.title, description: events.description,
    category: events.category, startsAt: events.startsAt, endsAt: events.endsAt,
    allDay: events.allDay, location: events.location, virtualUrl: events.virtualUrl,
    imageUrl: events.imageUrl, externalRsvpUrl: events.externalRsvpUrl,
  }).from(events)
    .where(and(
      eq(events.visibility, 'public'),
      eq(events.published, true),
      gte(events.startsAt, now),
    ))
    .orderBy(asc(events.startsAt))
    .limit(50)

  return rows
})
