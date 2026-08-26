import { eq, and } from 'drizzle-orm'
import { users } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const admin = await currentAdmin(event)
  if (!admin) return { admin: null, boardUser: null }

  // Board-console identity: the users row matching the signed-in email.
  let boardUser = null
  try {
    const db = useDb()
    const [u] = await db.select().from(users)
      .where(and(eq(users.email, admin.email), eq(users.active, true))).limit(1)
    if (u) boardUser = { id: u.id, email: u.email, name: u.name, role: u.role }
  } catch (e) {
    console.error('boardUser lookup failed:', e)
  }
  return { admin, boardUser }
})
