import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { events } from '~~/server/database/schema'

const Body = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  category: z.enum(['showcase', 'workshop', 'community', 'conference', 'fundraiser', 'deadline', 'civic', 'other']).optional(),
  visibility: z.enum(['public', 'board']).optional(),
  published: z.boolean().optional(),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().nullable().optional(),
  allDay: z.boolean().optional(),
  location: z.string().nullable().optional(),
  virtualUrl: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  externalRsvpUrl: z.string().nullable().optional(),
  rsvpRequired: z.boolean().optional(),
  rsvpDeadline: z.coerce.date().nullable().optional(),
  boardRepNote: z.string().nullable().optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireAgendaAccess(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = Body.parse(await readBody(event))
  const db = useDb()

  const [existing] = await db.select().from(events).where(eq(events.id, id)).limit(1)
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Event not found' })

  const visibility = body.visibility ?? existing.visibility
  const published = body.published ?? existing.published
  if (visibility === 'board' && published) {
    throw createError({
      statusCode: 422,
      statusMessage: 'A board-only event cannot stay published. Unpublish it, or make it public.',
    })
  }

  const [updated] = await db.update(events).set(body).where(eq(events.id, id)).returning()
  await logAction(user.id, 'update', 'event', id)
  return updated
})
