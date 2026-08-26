import { eq, asc } from 'drizzle-orm'
import { merchItems } from '~~/server/database/schema'
import { centsToDollars } from '~~/server/utils/money'

/** Board console listing: everything, published or not. */
export default defineEventHandler(async (event) => {
  await requireUser(event)
  const db = useDb()

  const rows = await db.select().from(merchItems)
    .orderBy(asc(merchItems.sortOrder), asc(merchItems.name))

  return rows.map(r => ({
    ...r,
    priceFormatted: centsToDollars(r.priceCents),
    soldOut: r.stockQty !== null && r.stockQty <= 0,
  }))
})
