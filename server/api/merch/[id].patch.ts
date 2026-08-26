import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { merchItems } from '~~/server/database/schema'
import { centsToDollars, dollarsToCents } from '~~/server/utils/money'

const Body = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  category: z.enum(['apparel', 'print', 'accessory', 'music', 'bundle', 'other']).optional(),
  price: z.union([z.string(), z.number()]).optional(),
  imageUrl: z.string().nullable().optional(),
  sizes: z.string().nullable().optional(),
  stockQty: z.number().int().min(0).nullable().optional(),
  externalUrl: z.string().nullable().optional(),
  availableInPerson: z.boolean().optional(),
  published: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireAgendaAccess(event)
  const id = Number(getRouterParam(event, 'id'))
  const { price, ...rest } = Body.parse(await readBody(event))
  const db = useDb()

  const patch: Record<string, unknown> = { ...rest }
  if (price !== undefined) patch.priceCents = dollarsToCents(price)

  const [updated] = await db.update(merchItems).set(patch).where(eq(merchItems.id, id)).returning()
  if (!updated) throw createError({ statusCode: 404, statusMessage: 'Item not found' })

  await logAction(user.id, 'update', 'merch_item', id)
  return { ...updated, priceFormatted: centsToDollars(updated.priceCents) }
})
