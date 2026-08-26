import { eq, and } from 'drizzle-orm'
import { meetings, members, attendance } from '~~/server/database/schema'
import { quorumFor, isRegularSeat } from '~~/server/utils/motions'

/**
 * Opens the meeting. Freezes the seat count so quorum is judged against the
 * board as constituted at this moment, not as it looks whenever the record is
 * read back later.
 */
export default defineEventHandler(async (event) => {
  const user = await requireRole(event, 'officer')
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()

  const [meeting] = await db.select().from(meetings).where(eq(meetings.id, id)).limit(1)
  if (!meeting) throw createError({ statusCode: 404, statusMessage: 'Meeting not found' })
  if (meeting.status === 'in_progress') throw createError({ statusCode: 409, statusMessage: 'Meeting is already in progress' })
  if (meeting.status === 'adjourned') throw createError({ statusCode: 409, statusMessage: 'Meeting has already adjourned' })

  const seated = await db.select().from(members).where(eq(members.seated, true))
  const regulars = seated.filter(m => isRegularSeat(m.position))
  const quorum = quorumFor(regulars.length)

  // Seed a roll-call row for every seated member, defaulting to absent; the
  // chair then marks who is present.
  const existing = await db.select().from(attendance).where(eq(attendance.meetingId, id))
  const missing = seated.filter(s => !existing.some(e => e.memberId === s.id))
  if (missing.length) {
    await db.insert(attendance).values(missing.map(s => ({ meetingId: id, memberId: s.id, status: 'absent' as const })))
  }

  await db.update(meetings).set({
    status: 'in_progress',
    calledToOrderAt: new Date(),
    seatsAtNotice: regulars.length,
    quorumRequired: quorum,
  }).where(eq(meetings.id, id))

  await logAction(user.id, 'call_to_order', 'meeting', id)
  return {
    calledToOrderAt: new Date(),
    regularSeats: regulars.length,
    alternateSeats: seated.length - regulars.length,
    quorumRequired: quorum,
  }
})
