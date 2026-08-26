import { eq, sql } from 'drizzle-orm'
import { users, members } from '~~/server/database/schema'

/**
 * Creates (or resets) a throwaway admin/admin account for local development.
 *
 * `import.meta.dev` is replaced with a literal `false` at build time, so this
 * whole handler is dead code in a production bundle - the endpoint cannot be
 * reached on a deployed site even if the file ships.
 */
export default defineEventHandler(async (event) => {
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const db = useDb()
  const passwordHash = await hashPassword('admin')

  const [existing] = await db.select().from(users).where(eq(users.email, 'admin')).limit(1)

  if (existing) {
    await db.update(users)
      .set({ passwordHash, role: 'admin', active: true })
      .where(eq(users.id, existing.id))
    return { ok: true, created: false, email: 'admin', password: 'admin' }
  }

  const [user] = await db.insert(users).values({
    email: 'admin',
    name: 'Local Admin',
    role: 'admin',
    passwordHash,
  }).returning()

  // Give the local admin a seat so motions and voting can be exercised end to end.
  const [{ maxSeat }] = await db.select({ maxSeat: sql<number>`coalesce(max(${members.seatNumber}), 0)` }).from(members)
  await db.insert(members).values({
    userId: user.id,
    position: 'chair',
    title: 'Local development account',
    seatNumber: Number(maxSeat) + 1,
    seated: true,
  })

  return { ok: true, created: true, email: 'admin', password: 'admin' }
})
