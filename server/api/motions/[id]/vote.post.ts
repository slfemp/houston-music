import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { motions, votes, attendance } from '~~/server/database/schema'
import { requireStanding } from '~~/server/utils/quorum'

const Body = z.object({
  choice: z.enum(['aye', 'nay', 'abstain', 'recuse']),
  /** Required for a recusal so the conflict of interest is on the record. */
  reason: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const { user, seat } = await requireSeat(event)
  const id = Number(getRouterParam(event, 'id'))
  const { choice, reason } = Body.parse(await readBody(event))
  const db = useDb()

  const [motion] = await db.select().from(motions).where(eq(motions.id, id)).limit(1)
  if (!motion) throw createError({ statusCode: 404, statusMessage: 'Motion not found' })
  if (motion.status !== 'voting') {
    throw createError({ statusCode: 409, statusMessage: 'The chair has not put this question to a vote' })
  }
  if (choice === 'recuse' && !reason?.trim()) {
    throw createError({ statusCode: 422, statusMessage: 'State the conflict of interest when recusing' })
  }

  await requireStanding(motion.meetingId, seat.id, 'vote')

  // A member may change their vote until the chair closes the ballot.
  await db.insert(votes).values({ motionId: id, memberId: seat.id, choice, reason })
    .onConflictDoUpdate({
      target: [votes.motionId, votes.memberId],
      set: { choice, reason, castAt: new Date() },
    })

  await logAction(user.id, 'vote', 'motion', id, choice)

  const cast = await db.select().from(votes).where(eq(votes.motionId, id))
  return { recorded: choice, votesCast: cast.length }
})
