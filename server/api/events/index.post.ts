import { z } from 'zod'
import { events } from '~~/server/database/schema'

const Body = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  category: z.enum(['showcase', 'workshop', 'community', 'conference', 'fundraiser', 'deadline', 'civic', 'other']).default('other'),
  /** 'board' keeps it internal; 'public' can be published to the website. */
  visibility: z.enum(['public', 'board']).default('board'),
  published: z.boolean().default(false),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date().optional(),
  allDay: z.boolean().default(false),
  location: z.string().optional(),
  virtualUrl: z.string().url().optional().or(z.literal('')),
  imageUrl: z.string().url().optional().or(z.literal('')),
  externalRsvpUrl: z.string().url().optional().or(z.literal('')),
  rsvpRequired: z.boolean().default(false),
  rsvpDeadline: z.coerce.date().optional(),
  boardRepNote: z.string().optional(),
}).refine(v => !v.endsAt || v.endsAt >= v.startsAt, {
  message: 'endsAt must not fall before startsAt', path: ['endsAt'],
}).refine(v => !(v.published && v.visibility === 'board'), {
  message: 'A board-only event cannot be published to the public site', path: ['published'],
})

export default defineEventHandler(async (event) => {
  const user = await requireAgendaAccess(event)
  const body = Body.parse(await readBody(event))
  const db = useDb()

  const [row] = await db.insert(events).values({
    ...body,
    virtualUrl: body.virtualUrl || null,
    imageUrl: body.imageUrl || null,
    externalRsvpUrl: body.externalRsvpUrl || null,
    createdByUserId: user.id,
  }).returning()

  await logAction(user.id, 'create', 'event', row.id, `${body.visibility}: ${body.title}`)
  return row
})
