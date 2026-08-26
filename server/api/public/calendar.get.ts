import { and, gte, lte, eq, inArray } from 'drizzle-orm'
import { meetings, events, volunteerOpportunities } from '~~/server/database/schema'
import type { CalendarEntry } from '~~/server/utils/calendar'

/**
 * Public calendar feed. Board-only events, unpublished events, and un-noticed
 * meetings are excluded in the SQL - not filtered client-side - so nothing
 * internal can reach the page through a rendering mistake.
 */
export async function publicEntries(from: Date, to: Date): Promise<CalendarEntry[]> {
  const db = useDb()

  const meetingRows = await db.select().from(meetings).where(and(
    gte(meetings.startsAt, from), lte(meetings.startsAt, to),
    inArray(meetings.status, ['noticed', 'in_progress', 'adjourned']),
  ))
  const eventRows = await db.select().from(events).where(and(
    gte(events.startsAt, from), lte(events.startsAt, to),
    eq(events.visibility, 'public'), eq(events.published, true),
  ))
  const volRows = await db.select().from(volunteerOpportunities).where(and(
    gte(volunteerOpportunities.startsAt, from), lte(volunteerOpportunities.startsAt, to),
    eq(volunteerOpportunities.published, true),
  ))

  return [
    ...meetingRows.filter(m => m.noticePostedAt).map(m => ({
      id: String(m.id), kind: 'meeting' as const, title: m.title,
      description: null, startsAt: m.startsAt, endsAt: m.endsAt, allDay: false,
      location: m.location, url: m.virtualUrl, visibility: 'public' as const, category: m.type,
    })),
    ...eventRows.map(e => ({
      id: String(e.id), kind: 'event' as const, title: e.title,
      description: e.description, startsAt: e.startsAt, endsAt: e.endsAt, allDay: e.allDay,
      location: e.location, url: e.externalRsvpUrl ?? e.virtualUrl,
      visibility: 'public' as const, category: e.category,
    })),
    ...volRows.filter(v => v.startsAt).map(v => ({
      id: String(v.id), kind: 'volunteer' as const, title: v.title,
      description: v.description, startsAt: v.startsAt!, endsAt: v.endsAt, allDay: false,
      location: v.location, url: '/volunteer', visibility: 'public' as const, category: 'volunteer',
    })),
  ].sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event) as { from?: string, to?: string }
  const from = q.from ? new Date(q.from) : new Date(Date.now() - 180 * 86_400_000)
  const to = q.to ? new Date(q.to) : new Date(Date.now() + 365 * 86_400_000)
  return publicEntries(from, to)
})
