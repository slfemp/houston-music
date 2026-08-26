import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { members, users } from '~~/server/database/schema'

const Body = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(12).optional(),
  role: z.enum(['admin', 'officer', 'member', 'staff']).default('member'),
  position: z.enum(['chair', 'vice_chair', 'secretary', 'treasurer', 'member']).default('member'),
  organization: z.string().optional(),
  title: z.string().optional(),
  seatNumber: z.number().int().positive().optional(),
  termStart: z.coerce.date().optional(),
  termEnd: z.coerce.date().optional(),
  /** Staff and liaisons get an account without a seat, so they cannot vote. */
  seatMember: z.boolean().default(true),
})

export default defineEventHandler(async (event) => {
  const admin = await requireRole(event, 'admin')
  const body = Body.parse(await readBody(event))
  const db = useDb()
  const email = body.email.toLowerCase().trim()

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (existing) throw createError({ statusCode: 409, statusMessage: 'That email already has an account' })

  // A temporary password is returned once so the admin can hand it over; it is
  // never stored in plaintext and never shown again.
  const tempPassword = body.password ?? `hmab-${crypto.randomUUID().slice(0, 12)}`

  const [user] = await db.insert(users).values({
    email,
    name: body.name,
    role: body.role,
    passwordHash: await hashPassword(tempPassword),
  }).returning()

  let seat = null
  if (body.seatMember) {
    ;[seat] = await db.insert(members).values({
      userId: user.id,
      position: body.position,
      organization: body.organization,
      title: body.title,
      seatNumber: body.seatNumber,
      termStart: body.termStart,
      termEnd: body.termEnd,
    }).returning()
  }

  await logAction(admin.id, 'create', 'member', seat?.id ?? user.id, `${body.name} <${email}>`)
  return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, seat, tempPassword: body.password ? undefined : tempPassword }
})
