import { eq, and, lt, desc, inArray } from 'drizzle-orm'
import { motions, votes, attendance, meetings, treasurerReports, issues, agendaItems } from '~~/server/database/schema'
import { decideMotion, describeThreshold, type Threshold } from '~~/server/utils/motions'
import { quorumState } from '~~/server/utils/quorum'

/**
 * The chair closes the ballot. Tallies are frozen onto the motion so the record
 * cannot drift if membership or attendance is edited afterwards, and the
 * outcome is applied to whatever the motion was about.
 */
export default defineEventHandler(async (event) => {
  const user = await requireRole(event, 'officer')
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()

  const [motion] = await db.select().from(motions).where(eq(motions.id, id)).limit(1)
  if (!motion) throw createError({ statusCode: 404, statusMessage: 'Motion not found' })
  if (motion.status !== 'voting') {
    throw createError({ statusCode: 409, statusMessage: `Cannot close a motion that is ${motion.status}` })
  }

  const cast = await db.select().from(votes).where(eq(votes.motionId, id))
  const q = await quorumState(motion.meetingId)
  // Only members entitled to vote are polled - an alternate who was never
  // seated is not "present, not voting", they simply had no vote to cast.
  const present = q.votingMemberIds.map(memberId => ({ memberId }))

  // Members present who never voted are recorded as not voting, so the roll
  // call accounts for everyone rather than silently omitting them.
  const silent = present.filter(p => !cast.some(v => v.memberId === p.memberId))
  if (silent.length) {
    await db.insert(votes).values(silent.map(s => ({ motionId: id, memberId: s.memberId, choice: 'abstain' as const, reason: 'Present, not voting' })))
  }

  const final = await db.select().from(votes).where(eq(votes.motionId, id))
  const tally = {
    ayes: final.filter(v => v.choice === 'aye').length,
    nays: final.filter(v => v.choice === 'nay').length,
    abstentions: final.filter(v => v.choice === 'abstain').length,
    recusals: final.filter(v => v.choice === 'recuse').length,
    absent: Math.max(0, (motion.seatsAtVote ?? q.regularSeats) - present.length),
  }

  const threshold = motion.threshold as Threshold
  const outcome = decideMotion(tally, threshold)

  const [updated] = await db.update(motions).set({
    status: outcome, ...tally, closedAt: new Date(),
  }).where(eq(motions.id, id)).returning()

  // Apply the decision.
  if (outcome === 'carried') {
    switch (motion.kind) {
      case 'approve_minutes': {
        // Adopt the named meeting's minutes, or the most recent unapproved set.
        let target = motion.relatedMeetingId ?? null
        if (!target) {
          const [prev] = await db.select().from(meetings)
            .where(and(lt(meetings.startsAt, new Date()), inArray(meetings.minutesStatus, ['draft', 'submitted'])))
            .orderBy(desc(meetings.startsAt)).limit(1)
          target = prev?.id ?? null
        }
        if (target) {
          await db.update(meetings)
            .set({ minutesStatus: 'approved', minutesApprovedByMotionId: id })
            .where(eq(meetings.id, target))
        }
        break
      }
      case 'accept_report': {
        const [report] = await db.select().from(treasurerReports)
          .where(eq(treasurerReports.meetingId, motion.meetingId)).limit(1)
        if (report) {
          await db.update(treasurerReports).set({ acceptedByMotionId: id }).where(eq(treasurerReports.id, report.id))
        }
        break
      }
      case 'lay_on_table':
        if (motion.parentMotionId) {
          await db.update(motions).set({ status: 'tabled' }).where(eq(motions.id, motion.parentMotionId))
        }
        break
      case 'adjourn':
        await db.update(meetings).set({ status: 'adjourned', adjournedAt: new Date() }).where(eq(meetings.id, motion.meetingId))
        break
    }

    // Resolve the originating issue when its agenda item is decided.
    if (motion.agendaItemId) {
      const [item] = await db.select().from(agendaItems).where(eq(agendaItems.id, motion.agendaItemId)).limit(1)
      if (item?.issueId) {
        await db.update(issues).set({ status: 'resolved', updatedAt: new Date() }).where(eq(issues.id, item.issueId))
      }
    }
  }

  await logAction(user.id, 'close_vote', 'motion', id, `${outcome}: ${tally.ayes}-${tally.nays}-${tally.abstentions}`)

  return {
    motion: updated,
    outcome,
    tally,
    threshold,
    explanation: describeThreshold(threshold, tally),
    rollCall: final.map(v => ({ memberId: v.memberId, choice: v.choice, reason: v.reason })),
  }
})
