import { sql, ne, eq, like, or } from 'drizzle-orm'
import { z } from 'zod'
import {
  users, members, meetings, agendaItems, attendance, motions, votes,
  issues, issueSupport, accounts, transactions, budgetLines, treasurerReports,
  events, eventRsvps, merchItems, volunteerOpportunities, volunteerSignups, auditLog,
  musicians, bookingVenues,
} from '~~/server/database/schema'

const Body = z.object({
  /** Keep user accounts and board seats; wipe only the content. Default true. */
  keepRoster: z.boolean().default(true),
}).default({ keepRoster: true })

/**
 * Removes demo content. Dev-only, same as the seeder.
 *
 * Deletion order matters: children before parents, because the schema declares
 * real foreign keys. Cascades would cover most of it, but being explicit means
 * this still works if cascade behaviour changes.
 */
export default defineEventHandler(async (event) => {
  if (!import.meta.dev) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  const body = Body.parse(await readBody(event).catch(() => ({})))
  const db = useDb()

  const before = Number((await db.select({ c: sql<number>`count(*)` }).from(meetings))[0].c)

  // Children first.
  await db.delete(votes)
  await db.delete(motions)
  await db.delete(attendance)
  await db.delete(agendaItems)
  await db.delete(treasurerReports)
  await db.delete(meetings)

  await db.delete(issueSupport)
  await db.delete(issues)

  await db.delete(transactions)
  await db.delete(budgetLines)
  await db.delete(accounts)

  await db.delete(eventRsvps)
  await db.delete(events)

  await db.delete(merchItems)

  await db.delete(volunteerSignups)
  await db.delete(volunteerOpportunities)

  await db.delete(musicians)
  await db.delete(bookingVenues)

  await db.delete(auditLog)

  let usersRemoved = 0
  if (!body.keepRoster) {
    // Keep the local dev admin so the console stays reachable after a wipe.
    const keep = await db.select().from(users).where(eq(users.email, 'admin'))
    const keepIds = new Set(keep.map(k => k.id))

    const all = await db.select().from(users)
    for (const u of all) {
      if (keepIds.has(u.id)) continue
      await db.delete(members).where(eq(members.userId, u.id))
      await db.delete(users).where(eq(users.id, u.id))
      usersRemoved++
    }
  }

  return {
    ok: true,
    clearedMeetings: before,
    rosterKept: body.keepRoster,
    usersRemoved,
    note: body.keepRoster
      ? 'Content cleared. Board roster and accounts kept. Re-seed with POST /api/dev/seed-demo.'
      : 'Content and roster cleared. The local admin account was preserved.',
  }
})
