import { eq, and, gte, lte, sql, desc } from 'drizzle-orm'
import { accounts, transactions, budgetLines } from '~~/server/database/schema'
import { centsToDollars } from '~~/server/utils/money'

/**
 * The treasurer's dashboard: what is in each account now, where the money went
 * this fiscal year, and how that compares with the adopted budget.
 *
 * Balances are computed from the ledger (opening balance + all transactions)
 * rather than stored, so a running balance can never drift out of agreement
 * with the transactions behind it.
 */
export default defineEventHandler(async (event) => {
  await requireUser(event)
  const db = useDb()
  const q = getQuery(event) as { fiscalYear?: string }
  const fiscalYear = Number(q.fiscalYear) || new Date().getFullYear()

  const yearStart = new Date(Date.UTC(fiscalYear, 0, 1))
  const yearEnd = new Date(Date.UTC(fiscalYear + 1, 0, 1))

  const accountRows = await db.select().from(accounts).where(eq(accounts.active, true))

  const balances = await db.select({
    accountId: transactions.accountId,
    total: sql<number>`coalesce(sum(${transactions.amountCents}), 0)`,
  }).from(transactions).groupBy(transactions.accountId)

  const withBalances = accountRows.map((a) => {
    const moved = Number(balances.find(b => b.accountId === a.id)?.total ?? 0)
    const balanceCents = a.openingBalanceCents + moved
    return { ...a, balanceCents, balanceFormatted: centsToDollars(balanceCents) }
  })

  const totalCents = withBalances.reduce((sum, a) => sum + a.balanceCents, 0)
  const unrestrictedCents = withBalances
    .filter(a => a.type !== 'restricted' && a.type !== 'grant')
    .reduce((sum, a) => sum + a.balanceCents, 0)

  const byCategory = await db.select({
    category: transactions.category,
    type: transactions.type,
    total: sql<number>`coalesce(sum(${transactions.amountCents}), 0)`,
    count: sql<number>`count(*)`,
  }).from(transactions)
    .where(and(gte(transactions.occurredOn, yearStart), lte(transactions.occurredOn, yearEnd)))
    .groupBy(transactions.category, transactions.type)

  const incomeCents = byCategory.filter(c => c.type === 'income').reduce((s, c) => s + Number(c.total), 0)
  const expenseCents = byCategory.filter(c => c.type === 'expense').reduce((s, c) => s + Number(c.total), 0)

  const budget = await db.select().from(budgetLines).where(eq(budgetLines.fiscalYear, fiscalYear))
  const budgetVsActual = budget.map((line) => {
    const actual = byCategory
      .filter(c => c.category === line.category)
      .reduce((s, c) => s + Math.abs(Number(c.total)), 0)
    const remaining = line.amountCents - actual
    return {
      category: line.category,
      kind: line.kind,
      budgetedCents: line.amountCents,
      actualCents: actual,
      remainingCents: remaining,
      percentUsed: line.amountCents > 0 ? Math.round((actual / line.amountCents) * 100) : 0,
      overBudget: line.kind === 'expense' && actual > line.amountCents,
    }
  })

  const recent = await db.select().from(transactions)
    .orderBy(desc(transactions.occurredOn)).limit(10)

  return {
    fiscalYear,
    accounts: withBalances,
    totals: {
      totalCents,
      totalFormatted: centsToDollars(totalCents),
      unrestrictedCents,
      unrestrictedFormatted: centsToDollars(unrestrictedCents),
      incomeCents,
      incomeFormatted: centsToDollars(incomeCents),
      // Expenses are stored negative; show the magnitude.
      expenseCents: Math.abs(expenseCents),
      expenseFormatted: centsToDollars(Math.abs(expenseCents)),
      netCents: incomeCents + expenseCents,
      netFormatted: centsToDollars(incomeCents + expenseCents),
    },
    byCategory: byCategory.map(c => ({
      ...c,
      total: Number(c.total),
      formatted: centsToDollars(Math.abs(Number(c.total))),
    })),
    budgetVsActual,
    recentTransactions: recent.map(t => ({ ...t, formatted: centsToDollars(t.amountCents) })),
  }
})
