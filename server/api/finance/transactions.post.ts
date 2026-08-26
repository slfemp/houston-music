import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { transactions, accounts, motions } from '~~/server/database/schema'
import { centsToDollars, dollarsToCents } from '~~/server/utils/money'

const Body = z.object({
  accountId: z.number().int(),
  occurredOn: z.coerce.date(),
  /** Accepts "125.50", "$1,250", or a number. Always converted to integer cents. */
  amount: z.union([z.string(), z.number()]),
  type: z.enum(['income', 'expense', 'transfer']),
  category: z.string(),
  payee: z.string().optional(),
  memo: z.string().optional(),
  reference: z.string().optional(),
  receiptUrl: z.string().url().optional().or(z.literal('')),
  approvedByMotionId: z.number().int().optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireRole(event, 'officer')
  const body = Body.parse(await readBody(event))
  const db = useDb()

  const [account] = await db.select().from(accounts).where(eq(accounts.id, body.accountId)).limit(1)
  if (!account) throw createError({ statusCode: 404, statusMessage: 'Account not found' })

  // Normalise sign from `type` so an expense can never be entered as a positive
  // number and silently inflate the balance.
  const magnitude = Math.abs(dollarsToCents(body.amount))
  const amountCents = body.type === 'income' ? magnitude : -magnitude

  const threshold = Number(useRuntimeConfig().expenditureApprovalThresholdCents ?? 50000)
  if (body.type === 'expense' && magnitude >= threshold && !body.approvedByMotionId) {
    throw createError({
      statusCode: 422,
      statusMessage: `Expenditures of ${centsToDollars(threshold)} or more require an approving motion. Record the vote first, then cite it here.`,
    })
  }
  if (body.approvedByMotionId) {
    const [m] = await db.select().from(motions).where(eq(motions.id, body.approvedByMotionId)).limit(1)
    if (!m) throw createError({ statusCode: 404, statusMessage: 'Approving motion not found' })
    if (m.status !== 'carried') {
      throw createError({ statusCode: 422, statusMessage: `Motion #${m.id} did not carry (${m.status}) and cannot authorize spending` })
    }
  }

  const [tx] = await db.insert(transactions).values({
    accountId: body.accountId,
    occurredOn: body.occurredOn,
    amountCents,
    type: body.type,
    category: body.category as any,
    payee: body.payee,
    memo: body.memo,
    reference: body.reference,
    receiptUrl: body.receiptUrl || null,
    approvedByMotionId: body.approvedByMotionId,
    enteredByUserId: user.id,
  }).returning()

  await logAction(user.id, 'create', 'transaction', tx.id, `${body.type} ${centsToDollars(amountCents)}`)
  return { ...tx, formatted: centsToDollars(tx.amountCents) }
})
