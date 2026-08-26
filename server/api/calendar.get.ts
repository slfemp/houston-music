import { and, gte, lte, inArray, eq } from 'drizzle-orm'
import { meetings, events, volunteerOpportunities } from '~~/server/database/schema'
import type { CalendarEntry } from '~~/server/utils/calendar'

/**
 * Unified feed for the board console: meetings, events (public AND board-only),
 * and volunteer shifts in one list.
 */
export default defineEventHandler(async (event) => {
  await requireUser(event)
  const db = useDb()
  const q = getQuery(event) as { from?: string, to?: string }

  // Default to a wide window so month navigation rarely refetches.
  const from = q.from ? new Date(q.from) : new Date(Date.now() - 180 * 86_400_000)
  const to = q.to ? new Date(q.to) : new Date(Date.now() + 365 * 86_400_000)

  const meetingRows = await db.select().from(meetings)
    .where(and(gte(meetings.startsAt, from), lte(meetings.startsAt, to)))
  const eventRows = await db.select().from(events)
    .where(and(gte(events.startsAt, from), lte(events.startsAt, to)))
  const volRows = await db.select().from(volunteerOpportunities)
    .where(and(gte(volunteerOpportunities.startsAt, from), lte(volunteerOpportunities.startsAt, to)))

  const entries: CalendarEntry[] = [
    ...meetingRows.map(m => ({
      id: String(m.id), kind: 'meeting' as const, title: m.title,
      description: m.type, startsAt: m.startsAt, endsAt: m.endsAt, allDay: false,
      location: m.location, url: `/board/meetings/${m.id}`,
      // A draft meeting is not public knowledge until notice is posted.
      visibility: (m.status === 'noticed' || m.status === 'in_progress' ? 'public' : 'board') as 'public' | 'board',
      category: m.status,
    })),
    ...eventRows.map(e => ({
      id: String(e.id), kind: 'event' as const, title: e.title,
      description: e.description, startsAt: e.startsAt, endsAt: e.endsAt, allDay: e.allDay,
      location: e.location, url: '/board/events',
      visibility: (e.visibility === 'public' && e.published ? 'public' : 'board') as 'public' | 'board',
      category: e.category,
    })),
    ...volRows.filter(v => v.startsAt).map(v => ({
      id: String(v.id), kind: 'volunteer' as const, title: v.title,
      description: v.description, startsAt: v.startsAt!, endsAt: v.endsAt, allDay: false,
      location: v.location, url: '/board/volunteers',
      visibility: (v.published ? 'public' : 'board') as 'public' | 'board',
      category: 'volunteer',
    })),
  ].sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())

  return entries
})
