import { asc } from 'drizzle-orm'
import { bookingVenues } from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const db = useDb()
  return db.select().from(bookingVenues).orderBy(asc(bookingVenues.name)).limit(500)
})
