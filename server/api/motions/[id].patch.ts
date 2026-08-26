import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { motions } from '~~/server/database/schema'

const Body = z.object({
  status: z.enum(['withdrawn', 'ruled_out_of_order', 'tabled']).optional(),
  text: z.string().min(3).optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireRole(event, 'officer')
  const id = Number(getRouterParam(event, 'id'))
  const body = Body.parse(await readBody(event))
  const db = useDb()

  const [motion] = await db.select().from(motions).where(eq(motions.id, id)).limit(1)
  if (!motion) throw createError({ statusCode: 404, statusMessage: 'Motion not found' })

  // A decided question is part of the record. It is reopened by a motion to
  // reconsider or rescind, never by editing the original.
  if (['carried', 'failed'].includes(motion.status)) {
    throw createError({
      statusCode: 409,
      statusMessage: 'This motion has been decided. Use a motion to reconsider or to rescind.',
    })
  }
  if (body.text && motion.status === 'voting') {
    throw createError({ statusCode: 409, statusMessage: 'Cannot reword a motion while the vote is open' })
  }

  const [updated] = await db.update(motions).set(body).where(eq(motions.id, id)).returning()
  await logAction(user.id, 'update', 'motion', id, JSON.stringify(body))
  return updated
})
