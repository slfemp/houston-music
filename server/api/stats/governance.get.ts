import { eq, inArray, sql, desc } from 'drizzle-orm'
import { meetings, attendance, members, users, motions, votes, issues, issueSupport } from '~~/server/database/schema'

/**
 * Governance metrics: who shows up, how motions land, and where the backlog
 * sits. Rates are computed only over meetings a member could actually have
 * attended, so someone seated recently is not penalised for meetings that
 * predate their term.
 */
export default defineEventHandler(async (event) => {
  await requireUser(event)
  const db = useDb()

  const held = await db.select().from(meetings).where(eq(meetings.status, 'adjourned'))
  const heldIds = held.map(m => m.id)

  const roster = await db.select({
    memberId: members.id, name: users.name, position: members.position, seated: members.seated,
  }).from(members).innerJoin(users, eq(members.userId, users.id)).where(eq(members.seated, true))

  const rows = heldIds.length
    ? await db.select().from(attendance).where(inArray(attendance.meetingId, heldIds))
    : []

  const PRESENT = ['present', 'remote', 'late']
  const attendanceByMember = roster.map((r) => {
    const mine = rows.filter(a => a.memberId === r.memberId)
    const present = mine.filter(a => PRESENT.includes(a.status)).length
    const eligible = mine.length
    return {
      memberId: r.memberId,
      name: r.name,
      position: r.position,
      present,
      eligible,
      absent: mine.filter(a => a.status === 'absent').length,
      excused: mine.filter(a => a.status === 'excused').length,
      // null, not 0: "no meetings yet" is not the same as "never attends".
      rate: eligible ? Math.round((present / eligible) * 100) : null,
    }
  }).sort((a, b) => (b.rate ?? -1) - (a.rate ?? -1))

  const allMotions = await db.select().from(motions)
  const decided = allMotions.filter(m => ['carried', 'failed'].includes(m.status))

  const unanimous = decided.filter(m => m.status === 'carried' && (m.nays ?? 0) === 0).length

  const byKind = Object.entries(
    decided.reduce<Record<string, { carried: number, failed: number }>>((acc, m) => {
      acc[m.kind] ??= { carried: 0, failed: 0 }
      if (m.status === 'carried') acc[m.kind].carried++
      else acc[m.kind].failed++
      return acc
    }, {}),
  ).map(([kind, v]) => ({ kind, ...v, total: v.carried + v.failed }))
    .sort((a, b) => b.total - a.total)

  const issueRows = await db.select({
    id: issues.id, category: issues.category, status: issues.status, priority: issues.priority,
    support: sql<number>`(select coalesce(sum(${issueSupport.weight}),0) from ${issueSupport} where ${issueSupport.issueId} = ${issues.id})`,
  }).from(issues)

  const byCategory = Object.entries(
    issueRows.reduce<Record<string, number>>((acc, i) => {
      acc[i.category] = (acc[i.category] ?? 0) + 1
      return acc
    }, {}),
  ).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count)

  const topIssues = issueRows
    .filter(i => !['resolved', 'rejected'].includes(i.status))
    .map(i => ({ ...i, support: Number(i.support) }))
    .sort((a, b) => b.support - a.support)
    .slice(0, 8)

  return {
    meetingsHeld: held.length,
    attendance: attendanceByMember,
    averageAttendanceRate: attendanceByMember.length
      ? Math.round(attendanceByMember.reduce((s, a) => s + (a.rate ?? 0), 0) / attendanceByMember.filter(a => a.rate !== null).length || 0)
      : null,
    motions: {
      total: allMotions.length,
      decided: decided.length,
      carried: decided.filter(m => m.status === 'carried').length,
      failed: decided.filter(m => m.status === 'failed').length,
      unanimous,
      byKind,
    },
    issues: { total: issueRows.length, byCategory, topIssues },
  }
})
