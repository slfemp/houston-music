import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { users } from '~~/server/database/schema'

const Body = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(12, 'Use at least 12 characters'),
})

export default defineEventHandler(async (event) => {
  const me = await requireUser(event)
  const { currentPassword, newPassword } = Body.parse(await readBody(event))
  const db = useDb()

  const [user] = await db.select().from(users).where(eq(users.id, me.id)).limit(1)
  if (!user || !(await verifyPassword(user.passwordHash, currentPassword))) {
    throw createError({ statusCode: 403, statusMessage: 'Current password is incorrect' })
  }

  await db.update(users)
    .set({ passwordHash: await hashPassword(newPassword) })
    .where(eq(users.id, me.id))
  await logAction(me.id, 'password_change', 'user', me.id)

  return { ok: true }
})
