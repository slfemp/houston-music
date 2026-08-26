import { eq, asc } from 'drizzle-orm'
import { meetings, agendaItems } from '~~/server/database/schema'

/**
 * Posts the agenda publicly. Standard practice is at least 72 hours of notice;
 * short notice is allowed but recorded, so the shortfall shows on the record
 * instead of disappearing.
 */
export default defineEventHandler(async (event) => {
  const user = await requireAgendaAccess(event)
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()

  const [meeting] = await db.select().from(meetings).where(eq(meetings.id, id)).limit(1)
  if (!meeting) throw createError({ statusCode: 404, statusMessage: 'Meeting not found' })

  const items = await db.select().from(agendaItems)
    .where(eq(agendaItems.meetingId, id)).orderBy(asc(agendaItems.position))
  if (items.length === 0) {
    throw createError({ statusCode: 422, statusMessage: 'Cannot post notice for a meeting with an empty agenda' })
  }

  const postedAt = new Date()
  const leadHours = Math.floor((meeting.startsAt.getTime() - postedAt.getTime()) / 3_600_000)

  await db.update(meetings)
    .set({ noticePostedAt: postedAt, status: 'noticed' })
    .where(eq(meetings.id, id))

  await logAction(user.id, 'post_notice', 'meeting', id, `${leadHours}h notice`)

  return {
    postedAt,
    leadHours,
    requiredHours: meeting.noticeRequiredHours,
    shortNotice: leadHours < meeting.noticeRequiredHours,
    warning: leadHours < meeting.noticeRequiredHours
      ? `Posted ${leadHours}h before the meeting, short of the ${meeting.noticeRequiredHours}h standard. Recorded on the meeting record.`
      : null,
  }
})
