import { eq, desc, asc, gte, and, inArray, lt } from 'drizzle-orm'
import { meetings, agendaItems } from '~~/server/database/schema'
import { numberAgenda } from '~~/server/utils/agenda'

/**
 * What the public site shows. Draft meetings are invisible: an agenda becomes
 * public only when notice is posted, and minutes only once the board adopts them.
 */
export default defineEventHandler(async () => {
  const db = useDb()
  const now = new Date()

  const upcoming = await db.select().from(meetings)
    .where(and(gte(meetings.startsAt, now), inArray(meetings.status, ['noticed', 'in_progress'])))
    .orderBy(asc(meetings.startsAt)).limit(20)

  const past = await db.select().from(meetings)
    .where(and(lt(meetings.startsAt, now), eq(meetings.minutesStatus, 'approved')))
    .orderBy(desc(meetings.startsAt)).limit(20)

  const ids = [...upcoming, ...past].map(m => m.id)
  const items = ids.length
    ? await db.select().from(agendaItems)
        .where(inArray(agendaItems.meetingId, ids)).orderBy(asc(agendaItems.position))
    : []

  const shape = (m: typeof meetings.$inferSelect, withMinutes = false) => ({
    id: m.id,
    title: m.title,
    type: m.type,
    startsAt: m.startsAt,
    location: m.location,
    virtualUrl: m.virtualUrl,
    status: m.status,
    noticePostedAt: m.noticePostedAt,
    agenda: numberAgenda(items.filter(i => i.meetingId === m.id))
      .map(i => ({ itemNumber: i.itemNumber, kind: i.kind, title: i.title, description: i.description })),
    ...(withMinutes ? { minutes: m.minutesBody, minutesApprovedAt: m.minutesStatus === 'approved' } : {}),
  })

  return {
    upcoming: upcoming.map(m => shape(m)),
    past: past.map(m => shape(m, true)),
  }
})
