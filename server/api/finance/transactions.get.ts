import { desc, and, gte, lte, eq } from 'drizzle-orm'
import { transactions, accounts, users } from '~~/server/database/schema'
import { centsToDollars } from '~~/server/utils/money'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const db = useDb()
  const q = getQuery(event) as { from?: string, to?: string, accountId?: string, limit?: string }

  const filters = []
  if (q.from) filters.push(gte(transactions.occurredOn, new Date(q.from)))
  if (q.to) filters.push(lte(transactions.occurredOn, new Date(q.to)))
  if (q.accountId) filters.push(eq(transactions.accountId, Number(q.accountId)))

  const rows = await db.select({
    id: transactions.id, occurredOn: transactions.occurredOn,
    amountCents: transactions.amountCents, type: transactions.type,
    category: transactions.category, payee: transactions.payee, memo: transactions.memo,
    reference: transactions.reference, receiptUrl: transactions.receiptUrl,
    approvedByMotionId: transactions.approvedByMotionId,
    reconciledAt: transactions.reconciledAt,
    accountName: accounts.name, enteredBy: users.name,
  }).from(transactions)
    .innerJoin(accounts, eq(transactions.accountId, accounts.id))
    .leftJoin(users, eq(transactions.enteredByUserId, users.id))
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(transactions.occurredOn))
    .limit(Math.min(Number(q.limit) || 100, 500))

  return rows.map(r => ({ ...r, formatted: centsToDollars(r.amountCents) }))
})
