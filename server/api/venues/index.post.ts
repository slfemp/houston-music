import { z } from 'zod'
import { bookingVenues } from '~~/server/database/schema'

const Body = z.object({
  name: z.string().min(1).max(200),
  address: z.string().max(300).optional(),
  neighborhood: z.string().max(120).optional(),
  venueType: z.enum(['club', 'bar', 'theater', 'listening_room', 'outdoor', 'diy', 'restaurant', 'coffee', 'arena', 'record_store', 'other']).default('club'),
  capacity: z.number().int().min(1).max(100000).optional(),
  genresBooked: z.string().max(200).optional(),
  acceptsSubmissions: z.boolean().default(false),
  paysArtists: z.enum(['guarantee', 'door_split', 'ticket_split', 'guarantee_plus_split', 'tips_only', 'unpaid', 'varies']).default('varies'),
  bookingContactName: z.string().max(120).optional(),
  bookingEmail: z.string().email().optional().or(z.literal('')),
  bookingPhone: z.string().max(40).optional(),
  submissionUrl: z.string().url().optional().or(z.literal('')),
  submissionNotes: z.string().max(1000).optional(),
  allAges: z.boolean().default(false),
  hasBackline: z.boolean().default(false),
  hasSoundEngineer: z.boolean().default(false),
  stageNotes: z.string().max(500).optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  socialUrl: z.string().url().optional().or(z.literal('')),
  published: z.boolean().default(false),
  markVerified: z.boolean().default(true),
})

export default defineEventHandler(async (event) => {
  const user = await requireAgendaAccess(event)
  const { markVerified, ...body } = Body.parse(await readBody(event))
  const db = useDb()

  const [row] = await db.insert(bookingVenues).values({
    ...body,
    bookingEmail: body.bookingEmail || null,
    submissionUrl: body.submissionUrl || null,
    websiteUrl: body.websiteUrl || null,
    socialUrl: body.socialUrl || null,
    verifiedAt: markVerified ? new Date() : null,
    verifiedByUserId: markVerified ? user.id : null,
  }).returning()

  await logAction(user.id, 'create', 'venue', row.id, body.name)
  return row
})
