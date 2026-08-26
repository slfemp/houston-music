import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { bookingVenues } from '~~/server/database/schema'

const Body = z.object({
  name: z.string().min(1).optional(),
  address: z.string().nullable().optional(),
  neighborhood: z.string().nullable().optional(),
  venueType: z.enum(['club', 'bar', 'theater', 'listening_room', 'outdoor', 'diy', 'restaurant', 'coffee', 'arena', 'record_store', 'other']).optional(),
  capacity: z.number().int().nullable().optional(),
  genresBooked: z.string().nullable().optional(),
  acceptsSubmissions: z.boolean().optional(),
  paysArtists: z.enum(['guarantee', 'door_split', 'ticket_split', 'guarantee_plus_split', 'tips_only', 'unpaid', 'varies']).optional(),
  bookingContactName: z.string().nullable().optional(),
  bookingEmail: z.string().nullable().optional(),
  bookingPhone: z.string().nullable().optional(),
  submissionUrl: z.string().nullable().optional(),
  submissionNotes: z.string().nullable().optional(),
  allAges: z.boolean().optional(),
  hasBackline: z.boolean().optional(),
  hasSoundEngineer: z.boolean().optional(),
  stageNotes: z.string().nullable().optional(),
  websiteUrl: z.string().nullable().optional(),
  socialUrl: z.string().nullable().optional(),
  published: z.boolean().optional(),
  /** Re-confirming booking details is an explicit action, so the date means something. */
  markVerified: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireAgendaAccess(event)
  const id = Number(getRouterParam(event, 'id'))
  const { markVerified, ...body } = Body.parse(await readBody(event))
  const db = useDb()

  const [updated] = await db.update(bookingVenues).set({
    ...body,
    ...(markVerified ? { verifiedAt: new Date(), verifiedByUserId: user.id } : {}),
  }).where(eq(bookingVenues.id, id)).returning()
  if (!updated) throw createError({ statusCode: 404, statusMessage: 'Venue not found' })

  await logAction(user.id, 'update', 'venue', id)
  return updated
})
