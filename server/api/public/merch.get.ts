import { eq, asc } from 'drizzle-orm'
import { merchItems } from '~~/server/database/schema'
import { centsToDollars } from '~~/server/utils/money'

/** Public storefront. Unpublished items are excluded in the query. */
export default defineEventHandler(async () => {
  const db = useDb()

  const rows = await db.select({
    id: merchItems.id, name: merchItems.name, description: merchItems.description,
    category: merchItems.category, priceCents: merchItems.priceCents,
    imageUrl: merchItems.imageUrl, sizes: merchItems.sizes, stockQty: merchItems.stockQty,
    externalUrl: merchItems.externalUrl, availableInPerson: merchItems.availableInPerson,
  }).from(merchItems)
    .where(eq(merchItems.published, true))
    .orderBy(asc(merchItems.sortOrder), asc(merchItems.name))

  return rows.map(r => ({
    ...r,
    priceFormatted: centsToDollars(r.priceCents),
    sizeList: r.sizes ? r.sizes.split(',').map(s => s.trim()).filter(Boolean) : [],
    soldOut: r.stockQty !== null && r.stockQty <= 0,
  }))
})
