import { eq } from 'drizzle-orm'
import { merchItems } from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireRole(event, 'officer')
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()

  const [existing] = await db.select().from(merchItems).where(eq(merchItems.id, id)).limit(1)
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Item not found' })

  await db.delete(merchItems).where(eq(merchItems.id, id))
  await logAction(user.id, 'delete', 'merch_item', id, existing.name)
  return { ok: true }
})
