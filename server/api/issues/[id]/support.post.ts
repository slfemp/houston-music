import { eq, and, sql } from 'drizzle-orm'
import { issueSupport, issues } from '~~/server/database/schema'

/**
 * Toggles this member's support. Straw poll only - it ranks the backlog and
 * carries no binding force. Binding decisions require a motion in a meeting.
 */
export default defineEventHandler(async (event) => {
  const { user } = await requireSeat(event)
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()

  const [issue] = await db.select().from(issues).where(eq(issues.id, id)).limit(1)
  if (!issue) throw createError({ statusCode: 404, statusMessage: 'Issue not found' })

  const [existing] = await db.select().from(issueSupport)
    .where(and(eq(issueSupport.issueId, id), eq(issueSupport.userId, user.id))).limit(1)

  if (existing) {
    await db.delete(issueSupport).where(eq(issueSupport.id, existing.id))
  } else {
    await db.insert(issueSupport).values({ issueId: id, userId: user.id })
  }

  const [{ total }] = await db.select({ total: sql<number>`coalesce(sum(${issueSupport.weight}), 0)` })
    .from(issueSupport).where(eq(issueSupport.issueId, id))

  return { supporting: !existing, support: Number(total) }
})
