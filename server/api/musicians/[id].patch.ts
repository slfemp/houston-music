import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { musicians } from '~~/server/database/schema'

const Body = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  listed: z.boolean().optional(),
  reviewNote: z.string().max(500).nullable().optional(),
  genres: z.string().max(200).nullable().optional(),
  neighborhood: z.string().max(120).nullable().optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireAgendaAccess(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = Body.parse(await readBody(event))
  const db = useDb()

  const [updated] = await db.update(musicians)
    .set({ ...body, reviewedByUserId: user.id })
    .where(eq(musicians.id, id)).returning()
  if (!updated) throw createError({ statusCode: 404, statusMessage: 'Musician not found' })

  await logAction(user.id, 'review', 'musician', id, body.status)
  return updated
})
