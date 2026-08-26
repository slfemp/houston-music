import { eq } from 'drizzle-orm'
import { motions, attendance } from '~~/server/database/schema'
import { ruleFor, type MotionKind } from '~~/server/utils/motions'
import { requireStanding } from '~~/server/utils/quorum'

export default defineEventHandler(async (event) => {
  const { user, seat } = await requireSeat(event)
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()

  const [motion] = await db.select().from(motions).where(eq(motions.id, id)).limit(1)
  if (!motion) throw createError({ statusCode: 404, statusMessage: 'Motion not found' })
  if (motion.status !== 'proposed') {
    throw createError({ statusCode: 409, statusMessage: `This motion is ${motion.status} and cannot be seconded` })
  }
  // A motion needs support from a second member; the mover cannot supply it.
  if (motion.movedByMemberId === seat.id) {
    throw createError({ statusCode: 409, statusMessage: 'The member who made the motion cannot second it' })
  }

  await requireStanding(motion.meetingId, seat.id, 'second a motion')

  const rule = ruleFor(motion.kind as MotionKind)
  const [updated] = await db.update(motions).set({
    secondedByMemberId: seat.id,
    // A motion that cannot be debated goes straight to the vote once seconded.
    status: rule.debatable ? 'debating' : 'voting',
    openedAt: rule.debatable ? null : new Date(),
  }).where(eq(motions.id, id)).returning()

  await logAction(user.id, 'second', 'motion', id)
  return { ...updated, rule }
})
