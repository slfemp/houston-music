import { eq, asc, inArray } from 'drizzle-orm'
import { meetings, agendaItems, motions, votes, attendance, members, users, treasurerReports } from '~~/server/database/schema'
import { MOTION_RULES, type MotionKind } from '~~/server/utils/motions'
import { numberAgenda, noticeLeadHours } from '~~/server/utils/agenda'
import { quorumState } from '~~/server/utils/quorum'

/** Everything the meeting screen needs, in one round trip. */
export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()

  const [meeting] = await db.select().from(meetings).where(eq(meetings.id, id)).limit(1)
  if (!meeting) throw createError({ statusCode: 404, statusMessage: 'Meeting not found' })

  const items = await db.select().from(agendaItems)
    .where(eq(agendaItems.meetingId, id)).orderBy(asc(agendaItems.position))

  const motionRows = await db.select().from(motions)
    .where(eq(motions.meetingId, id)).orderBy(asc(motions.createdAt))

  const motionIds = motionRows.map(m => m.id)
  const voteRows = motionIds.length
    ? await db.select({
        id: votes.id, motionId: votes.motionId, memberId: votes.memberId,
        choice: votes.choice, reason: votes.reason, castAt: votes.castAt,
        memberName: users.name,
      }).from(votes)
        .innerJoin(members, eq(votes.memberId, members.id))
        .innerJoin(users, eq(members.userId, users.id))
        .where(inArray(votes.motionId, motionIds))
    : []

  const attendanceRows = await db.select({
    id: attendance.id, memberId: attendance.memberId, status: attendance.status,
    arrivedAt: attendance.arrivedAt, note: attendance.note, name: users.name,
    position: members.position, actingForMemberId: attendance.actingForMemberId,
  }).from(attendance)
    .innerJoin(members, eq(attendance.memberId, members.id))
    .innerJoin(users, eq(members.userId, users.id))
    .where(eq(attendance.meetingId, id))

  const [report] = await db.select().from(treasurerReports)
    .where(eq(treasurerReports.meetingId, id)).limit(1)

  const q = await quorumState(id)

  return {
    meeting: { ...meeting, noticeLeadHours: noticeLeadHours(meeting.noticePostedAt, meeting.startsAt) },
    agenda: numberAgenda(items),
    motions: motionRows.map(m => ({
      ...m,
      rule: MOTION_RULES[m.kind as MotionKind],
      votes: voteRows.filter(v => v.motionId === m.id),
    })),
    attendance: attendanceRows,
    treasurerReport: report ?? null,
    quorum: q,
  }
})
