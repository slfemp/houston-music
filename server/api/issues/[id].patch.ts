import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { issues } from '~~/server/database/schema'

const Body = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  category: z.enum(['venues', 'funding', 'policy', 'education', 'events', 'advocacy', 'internal', 'other']).optional(),
  status: z.enum(['submitted', 'under_review', 'scheduled', 'resolved', 'rejected', 'deferred']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  isPublic: z.boolean().optional(),
  resolutionNote: z.string().nullable().optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireAgendaAccess(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = Body.parse(await readBody(event))
  const db = useDb()

  const [updated] = await db.update(issues)
    .set({ ...body, updatedAt: new Date() }).where(eq(issues.id, id)).returning()
  if (!updated) throw createError({ statusCode: 404, statusMessage: 'Issue not found' })

  await logAction(user.id, 'update', 'issue', id, body.status)
  return updated
})
