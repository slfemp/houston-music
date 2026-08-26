import { z } from 'zod'
import { accounts } from '~~/server/database/schema'
import { dollarsToCents } from '~~/server/utils/money'

const Body = z.object({
  name: z.string().min(1),
  type: z.enum(['checking', 'savings', 'grant', 'restricted', 'petty_cash', 'reserve']).default('checking'),
  institution: z.string().optional(),
  lastFour: z.string().regex(/^\d{4}$/).optional(),
  openingBalance: z.union([z.string(), z.number()]).default(0),
  restrictedPurpose: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireRole(event, 'officer')
  const body = Body.parse(await readBody(event))
  const db = useDb()

  const [account] = await db.insert(accounts).values({
    name: body.name,
    type: body.type,
    institution: body.institution,
    lastFour: body.lastFour,
    openingBalanceCents: dollarsToCents(body.openingBalance),
    restrictedPurpose: body.restrictedPurpose,
  }).returning()

  await logAction(user.id, 'create', 'account', account.id, body.name)
  return account
})
