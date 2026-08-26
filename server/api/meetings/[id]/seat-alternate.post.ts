import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { members, attendance, meetings } from '~~/server/database/schema'
import { isRegularSeat } from '~~/server/utils/motions'
import { quorumState } from '~~/server/utils/quorum'

const Body = z.object({
  alternateMemberId: z.number().int(),
  /** null releases the alternate; otherwise the absent regular they stand in for. */
  actingForMemberId: z.number().int().nullable(),
})

/**
 * The chair seats an alternate in place of an absent regular member for this
 * meeting. Only while seated does the alternate count toward quorum or vote.
 */
export default defineEventHandler(async (event) => {
  const user = await requireRole(event, 'officer')
  const meetingId = Number(getRouterParam(event, 'id'))
  const { alternateMemberId, actingForMemberId } = Body.parse(await readBody(event))
  const db = useDb()

  const [meeting] = await db.select().from(meetings).where(eq(meetings.id, meetingId)).limit(1)
  if (!meeting) throw createError({ statusCode: 404, statusMessage: 'Meeting not found' })

  const [alt] = await db.select().from(members).where(eq(members.id, alternateMemberId)).limit(1)
  if (!alt) throw createError({ statusCode: 404, statusMessage: 'Member not found' })
  if (isRegularSeat(alt.position)) {
    throw createError({ statusCode: 422, statusMessage: 'That member already holds a regular seat' })
  }

  if (actingForMemberId !== null) {
    const [regular] = await db.select().from(members).where(eq(members.id, actingForMemberId)).limit(1)
    if (!regular || !isRegularSeat(regular.position)) {
      throw createError({ statusCode: 422, statusMessage: 'An alternate may only stand in for a regular seat' })
    }
    const [row] = await db.select().from(attendance)
      .where(and(eq(attendance.meetingId, meetingId), eq(attendance.memberId, actingForMemberId))).limit(1)
    if (row && ['present', 'remote', 'late'].includes(row.status)) {
      throw createError({
        statusCode: 409,
        statusMessage: 'That member is recorded present, so their seat is not open for an alternate',
      })
    }
    // Two alternates cannot cover the same absence.
    const taken = await db.select().from(attendance).where(eq(attendance.meetingId, meetingId))
    if (taken.some(a => a.actingForMemberId === actingForMemberId && a.memberId !== alternateMemberId)) {
      throw createError({ statusCode: 409, statusMessage: 'Another alternate is already seated for that member' })
    }
  }

  await db.insert(attendance)
    .values({
      meetingId, memberId: alternateMemberId,
      status: actingForMemberId === null ? 'absent' : 'present',
      actingForMemberId, arrivedAt: actingForMemberId === null ? null : new Date(),
    })
    .onConflictDoUpdate({
      target: [attendance.meetingId, attendance.memberId],
      set: {
        actingForMemberId,
        ...(actingForMemberId === null ? {} : { status: 'present' as const, arrivedAt: new Date() }),
      },
    })

  await logAction(user.id, actingForMemberId === null ? 'release_alternate' : 'seat_alternate', 'meeting', meetingId, `alt ${alternateMemberId}`)
  return quorumState(meetingId)
})
