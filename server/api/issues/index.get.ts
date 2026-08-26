import { eq, desc, sql, and, inArray } from 'drizzle-orm'
import { issues, issueSupport, users } from '~~/server/database/schema'

/** Backlog ranked by member support, so the chair can see what deserves agenda time. */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const db = useDb()
  const { status, category } = getQuery(event) as { status?: string, category?: string }

  const filters = []
  if (status) filters.push(inArray(issues.status, String(status).split(',') as any))
  if (category) filters.push(eq(issues.category, category as any))

  const rows = await db.select({
    id: issues.id, title: issues.title, description: issues.description,
    category: issues.category, status: issues.status, priority: issues.priority,
    submitterName: issues.submitterName, isPublic: issues.isPublic,
    resolutionNote: issues.resolutionNote,
    createdAt: issues.createdAt, updatedAt: issues.updatedAt,
    submittedBy: users.name,
    support: sql<number>`(select coalesce(sum(${issueSupport.weight}), 0) from ${issueSupport} where ${issueSupport.issueId} = ${issues.id})`,
    mySupport: sql<number>`(select count(*) from ${issueSupport} where ${issueSupport.issueId} = ${issues.id} and ${issueSupport.userId} = ${user.id})`,
  }).from(issues)
    .leftJoin(users, eq(issues.submittedByUserId, users.id))
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(issues.updatedAt))
    .limit(200)

  const rank = { urgent: 0, high: 1, normal: 2, low: 3 } as const
  return rows.sort((a, b) =>
    (rank[a.priority as keyof typeof rank] - rank[b.priority as keyof typeof rank])
    || (Number(b.support) - Number(a.support)))
})
