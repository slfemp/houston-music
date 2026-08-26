import { desc, eq, and, inArray } from 'drizzle-orm'
import { musicians } from '~~/server/database/schema'

/** Board console: the full record including contact details and pending submissions. */
export default defineEventHandler(async (event) => {
  await requireUser(event)
  const db = useDb()
  const { status } = getQuery(event) as { status?: string }

  return db.select().from(musicians)
    .where(status ? inArray(musicians.status, String(status).split(',') as any) : undefined)
    .orderBy(desc(musicians.createdAt))
    .limit(500)
})
