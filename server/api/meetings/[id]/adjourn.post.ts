import { eq } from 'drizzle-orm'
import { meetings, motions } from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireRole(event, 'officer')
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()

  const [meeting] = await db.select().from(meetings).where(eq(meetings.id, id)).limit(1)
  if (!meeting) throw createError({ statusCode: 404, statusMessage: 'Meeting not found' })

  // A motion left open would be recorded with no disposition; force the chair
  // to close or withdraw it before the meeting can end.
  const open = await db.select().from(motions).where(eq(motions.meetingId, id))
  const pending = open.filter(m => ['proposed', 'seconded', 'debating', 'voting'].includes(m.status))
  if (pending.length) {
    throw createError({
      statusCode: 409,
      statusMessage: `${pending.length} motion(s) still pending. Dispose of them before adjourning: ${pending.map(m => `#${m.id}`).join(', ')}`,
    })
  }

  const adjournedAt = new Date()
  await db.update(meetings).set({
    status: 'adjourned',
    adjournedAt,
    minutesStatus: meeting.minutesStatus === 'none' ? 'draft' : meeting.minutesStatus,
  }).where(eq(meetings.id, id))

  await logAction(user.id, 'adjourn', 'meeting', id)
  return { adjournedAt }
})
