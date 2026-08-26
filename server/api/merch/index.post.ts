import { z } from 'zod'
import { merchItems } from '~~/server/database/schema'
import { centsToDollars, dollarsToCents } from '~~/server/utils/money'

const Body = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1),
  category: z.enum(['apparel', 'print', 'accessory', 'music', 'bundle', 'other']).default('other'),
  /** Accepts "25", "$25.00", or 25 - stored as integer cents. */
  price: z.union([z.string(), z.number()]),
  imageUrl: z.string().url().optional().or(z.literal('')),
  sizes: z.string().optional(),
  stockQty: z.number().int().min(0).nullable().optional(),
  externalUrl: z.string().url().optional().or(z.literal('')),
  availableInPerson: z.boolean().default(true),
  published: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
})

export default defineEventHandler(async (event) => {
  const user = await requireAgendaAccess(event)
  const body = Body.parse(await readBody(event))
  const db = useDb()

  const priceCents = dollarsToCents(body.price)
  if (priceCents < 0) throw createError({ statusCode: 422, statusMessage: 'Price cannot be negative' })

  const [item] = await db.insert(merchItems).values({
    name: body.name,
    description: body.description,
    category: body.category,
    priceCents,
    imageUrl: body.imageUrl || null,
    sizes: body.sizes || null,
    stockQty: body.stockQty ?? null,
    externalUrl: body.externalUrl || null,
    availableInPerson: body.availableInPerson,
    published: body.published,
    sortOrder: body.sortOrder,
    createdByUserId: user.id,
  }).returning()

  await logAction(user.id, 'create', 'merch_item', item.id, body.name)
  return { ...item, priceFormatted: centsToDollars(item.priceCents) }
})
