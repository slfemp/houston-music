import { gte, and } from 'drizzle-orm'
import { transactions } from '~~/server/database/schema'
import { centsToDollars } from '~~/server/utils/money'

/**
 * Income and expense per calendar month. Buckets are built from a complete
 * month list rather than from the transactions, so a month with no activity
 * appears as a zero instead of collapsing the time axis.
 */
export default defineEventHandler(async (event) => {
  await requireUser(event)
  const db = useDb()
  const months = Math.min(Number((getQuery(event) as any).months) || 12, 36)

  const start = new Date()
  start.setUTCDate(1)
  start.setUTCHours(0, 0, 0, 0)
  start.setUTCMonth(start.getUTCMonth() - (months - 1))

  const rows = await db.select().from(transactions).where(gte(transactions.occurredOn, start))

  const buckets: Array<{ key: string, label: string, incomeCents: number, expenseCents: number }> = []
  for (let i = 0; i < months; i++) {
    const d = new Date(start)
    d.setUTCMonth(start.getUTCMonth() + i)
    buckets.push({
      key: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }),
      incomeCents: 0,
      expenseCents: 0,
    })
  }

  const index = new Map(buckets.map(b => [b.key, b]))
  for (const t of rows) {
    const d = t.occurredOn
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
    const bucket = index.get(key)
    if (!bucket) continue
    if (t.amountCents >= 0) bucket.incomeCents += t.amountCents
    else bucket.expenseCents += Math.abs(t.amountCents)
  }

  return buckets.map(b => ({
    ...b,
    netCents: b.incomeCents - b.expenseCents,
    incomeFormatted: centsToDollars(b.incomeCents),
    expenseFormatted: centsToDollars(b.expenseCents),
  }))
})
