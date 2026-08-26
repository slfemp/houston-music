import { eq, and } from 'drizzle-orm'
import { members, attendance, users } from '../database/schema'
import { quorumFor, isRegularSeat } from './motions'

const PRESENT = ['present', 'remote', 'late']

export interface QuorumState {
  /** Regular seats on the board - the quorum denominator. Excludes alternates. */
  regularSeats: number
  alternateSeats: number
  required: number
  /** Regular members present, plus alternates the chair has seated for this meeting. */
  present: number
  met: boolean
  /** Member ids entitled to move, second, and vote at this meeting. */
  votingMemberIds: number[]
}

/**
 * The single source of truth for who may act at a meeting.
 *
 * Alternates are not part of the quorum denominator and cannot vote unless the
 * chair has seated them for this meeting via `actingForMemberId`. Every route
 * that gates business goes through this so the rule cannot drift between the
 * roll-call screen and the vote handler.
 */
export async function quorumState(meetingId: number): Promise<QuorumState> {
  const db = useDb()

  const seated = await db.select().from(members).where(eq(members.seated, true))
  const regulars = seated.filter(m => isRegularSeat(m.position))
  const alternates = seated.filter(m => !isRegularSeat(m.position))

  const rows = await db.select().from(attendance).where(eq(attendance.meetingId, meetingId))
  const presentRows = rows.filter(a => PRESENT.includes(a.status))

  const regularPresent = presentRows.filter(a => regulars.some(r => r.id === a.memberId))
  // An alternate counts only while standing in for a named absent member.
  const actingAlternates = presentRows.filter(a =>
    a.actingForMemberId != null && alternates.some(alt => alt.id === a.memberId))

  return {
    regularSeats: regulars.length,
    alternateSeats: alternates.length,
    required: quorumFor(regulars.length),
    present: regularPresent.length + actingAlternates.length,
    met: regularPresent.length + actingAlternates.length >= quorumFor(regulars.length),
    votingMemberIds: [...regularPresent.map(a => a.memberId), ...actingAlternates.map(a => a.memberId)],
  }
}

/** Throws unless the meeting has quorum and this member may act in it. */
export async function requireStanding(meetingId: number, memberId: number, verb: string) {
  const q = await quorumState(meetingId)
  if (!q.met) {
    throw createError({
      statusCode: 409,
      statusMessage: `No quorum: ${q.present} present, ${q.required} of ${q.regularSeats} seats required`,
    })
  }
  if (!q.votingMemberIds.includes(memberId)) {
    throw createError({
      statusCode: 409,
      statusMessage: `You must be recorded present to ${verb}. Alternates must be seated for this meeting by the chair.`,
    })
  }
  return q
}
