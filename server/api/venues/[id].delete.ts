import { eq } from 'drizzle-orm'
import { bookingVenues } from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireRole(event, 'officer')
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()

  const [existing] = await db.select().from(bookingVenues).where(eq(bookingVenues.id, id)).limit(1)
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Venue not found' })

  await db.delete(bookingVenues).where(eq(bookingVenues.id, id))
  await logAction(user.id, 'delete', 'venue', id, existing.name)
  return { ok: true }
})
