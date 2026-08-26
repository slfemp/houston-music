import { eq } from 'drizzle-orm'
import { events } from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireRole(event, 'officer')
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()

  const [existing] = await db.select().from(events).where(eq(events.id, id)).limit(1)
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Event not found' })

  await db.delete(events).where(eq(events.id, id))
  await logAction(user.id, 'delete', 'event', id, existing.title)
  return { ok: true }
})
