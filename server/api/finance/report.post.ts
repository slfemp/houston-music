import { eq, and, gte, lte, lt, sql } from 'drizzle-orm'
import { z } from 'zod'
import { accounts, transactions, treasurerReports, meetings } from '~~/server/database/schema'
import { centsToDollars } from '~~/server/utils/money'

const Body = z.object({
  meetingId: z.number().int().optional(),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  narrative: z.string().optional(),
})

/**
 * Builds the treasurer's report for a period and snapshots the figures. Once
 * written the numbers stay put, so a back-dated transaction entered next month
 * cannot quietly rewrite a report the board already accepted.
 */
export default defineEventHandler(async (event) => {
  const user = await requireRole(event, 'officer')
  const body = Body.parse(await readBody(event))
  const db = useDb()

  if (body.periodEnd <= body.periodStart) {
    throw createError({ statusCode: 422, statusMessage: 'periodEnd must fall after periodStart' })
  }

  const accountRows = await db.select().from(accounts)
  const openingBase = accountRows.reduce((s, a) => s + a.openingBalanceCents, 0)

  const [{ before }] = await db.select({ before: sql<number>`coalesce(sum(${transactions.amountCents}), 0)` })
    .from(transactions).where(lt(transactions.occurredOn, body.periodStart))

  const period = await db.select().from(transactions)
    .where(and(gte(transactions.occurredOn, body.periodStart), lte(transactions.occurredOn, body.periodEnd)))

  const openingBalanceCents = openingBase + Number(before)
  const incomeCents = period.filter(t => t.amountCents > 0).reduce((s, t) => s + t.amountCents, 0)
  const expenseCents = period.filter(t => t.amountCents < 0).reduce((s, t) => s + t.amountCents, 0)
  const closingBalanceCents = openingBalanceCents + incomeCents + expenseCents

  const [report] = await db.insert(treasurerReports).values({
    meetingId: body.meetingId,
    periodStart: body.periodStart,
    periodEnd: body.periodEnd,
    openingBalanceCents,
    incomeCents,
    expenseCents: Math.abs(expenseCents),
    closingBalanceCents,
    narrative: body.narrative,
    preparedByUserId: user.id,
  }).returning()

  await logAction(user.id, 'create', 'treasurer_report', report.id)

  return {
    ...report,
    formatted: {
      opening: centsToDollars(openingBalanceCents),
      income: centsToDollars(incomeCents),
      expense: centsToDollars(Math.abs(expenseCents)),
      closing: centsToDollars(closingBalanceCents),
    },
    transactionCount: period.length,
  }
})
