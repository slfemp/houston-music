import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { members, users } from '~~/server/database/schema'

const Body = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(['admin', 'officer', 'member', 'staff']).optional(),
  active: z.boolean().optional(),
  position: z.enum(['chair', 'vice_chair', 'secretary', 'treasurer', 'member']).optional(),
  organization: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  seatNumber: z.number().int().positive().nullable().optional(),
  termStart: z.coerce.date().nullable().optional(),
  termEnd: z.coerce.date().nullable().optional(),
  seated: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  const admin = await requireRole(event, 'admin')
  const id = Number(getRouterParam(event, 'id'))
  const body = Body.parse(await readBody(event))
  const db = useDb()

  const [seat] = await db.select().from(members).where(eq(members.id, id)).limit(1)
  if (!seat) throw createError({ statusCode: 404, statusMessage: 'Member not found' })

  const { name, role, active, ...seatFields } = body
  if (name || role || active !== undefined) {
    await db.update(users).set({ ...(name && { name }), ...(role && { role }), ...(active !== undefined && { active }) })
      .where(eq(users.id, seat.userId))
  }
  if (Object.keys(seatFields).length) {
    await db.update(members).set(seatFields).where(eq(members.id, id))
  }

  await logAction(admin.id, 'update', 'member', id)
  const [updated] = await db.select().from(members).where(eq(members.id, id)).limit(1)
  return updated
})
