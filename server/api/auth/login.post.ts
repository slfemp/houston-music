import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { users } from '~~/server/database/schema'

const Body = z.object({
  // Not .email(): local/dev accounts may use a bare username. Lookup is an
  // exact match either way, so this loosens nothing that matters.
  email: z.string().min(1).max(320),
  password: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  const { email, password } = Body.parse(await readBody(event))
  const db = useDb()

  const [user] = await db.select().from(users)
    .where(eq(users.email, email.toLowerCase().trim())).limit(1)

  // Verify even when the user is missing so a wrong email and a wrong password
  // take the same time - otherwise the response time enumerates valid accounts.
  const ok = user
    ? await verifyPassword(user.passwordHash, password)
    : await verifyPassword('$scrypt$n=16384,r=8,p=1$aaaaaaaaaaaaaaaa$aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', password).catch(() => false)

  if (!user || !ok || !user.active) {
    throw createError({ statusCode: 401, statusMessage: 'Incorrect email or password' })
  }

  await setUserSession(event, {
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    loggedInAt: Date.now(),
  })
  await logAction(user.id, 'login', 'user', user.id)

  return { id: user.id, email: user.email, name: user.name, role: user.role }
})
