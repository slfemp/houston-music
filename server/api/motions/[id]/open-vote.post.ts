import { eq } from 'drizzle-orm'
import { motions } from '~~/server/database/schema'
import { ruleFor, type MotionKind } from '~~/server/utils/motions'

/** The chair puts the question. Debate closes; members may now vote. */
export default defineEventHandler(async (event) => {
  const user = await requireRole(event, 'officer')
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()

  const [motion] = await db.select().from(motions).where(eq(motions.id, id)).limit(1)
  if (!motion) throw createError({ statusCode: 404, statusMessage: 'Motion not found' })

  const rule = ruleFor(motion.kind as MotionKind)
  if (rule.needsSecond && !motion.secondedByMemberId) {
    throw createError({ statusCode: 409, statusMessage: 'This motion has not been seconded and dies for want of a second' })
  }
  if (!['proposed', 'seconded', 'debating'].includes(motion.status)) {
    throw createError({ statusCode: 409, statusMessage: `Cannot put a motion that is ${motion.status}` })
  }

  const [updated] = await db.update(motions)
    .set({ status: 'voting', openedAt: new Date() }).where(eq(motions.id, id)).returning()

  await logAction(user.id, 'open_vote', 'motion', id)
  return updated
})
