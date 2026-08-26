import { desc, gte, lt, and, inArray } from 'drizzle-orm'
import { meetings } from '~~/server/database/schema'
import { noticeLeadHours } from '~~/server/utils/agenda'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const db = useDb()
  const { scope = 'upcoming' } = getQuery(event) as { scope?: string }
  const now = new Date()

  const where = scope === 'past'
    ? lt(meetings.startsAt, now)
    : scope === 'all' ? undefined : gte(meetings.startsAt, now)

  const rows = await db.select().from(meetings)
    .where(where)
    .orderBy(scope === 'past' ? desc(meetings.startsAt) : meetings.startsAt)
    .limit(100)

  return rows.map(m => ({ ...m, noticeLeadHours: noticeLeadHours(m.noticePostedAt, m.startsAt) }))
})
