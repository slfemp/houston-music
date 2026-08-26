import { z } from 'zod'
import { issues } from '~~/server/database/schema'

const Body = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  category: z.enum(['venues', 'funding', 'policy', 'education', 'events', 'advocacy', 'internal', 'other']).default('other'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  /** Present only for anonymous submissions through the public form. */
  submitterName: z.string().max(120).optional(),
  submitterEmail: z.string().email().optional(),
})

export default defineEventHandler(async (event) => {
  const body = Body.parse(await readBody(event))
  const db = useDb()

  // Signed-in members raise issues under their own name; the public form is open.
  const session = await getUserSession(event).catch(() => null)
  const userId = (session?.user as any)?.id ?? null

  if (!userId && !body.submitterEmail) {
    throw createError({ statusCode: 422, statusMessage: 'Provide your email so the board can follow up' })
  }

  const [issue] = await db.insert(issues).values({
    title: body.title,
    description: body.description,
    category: body.category,
    // Only the board sets priority; public submissions start at normal.
    priority: userId ? body.priority : 'normal',
    submittedByUserId: userId,
    submitterName: userId ? null : body.submitterName,
    submitterEmail: userId ? null : body.submitterEmail,
    status: 'submitted',
  }).returning()

  await logAction(userId, 'create', 'issue', issue.id, body.title)
  return { id: issue.id, status: issue.status }
})
