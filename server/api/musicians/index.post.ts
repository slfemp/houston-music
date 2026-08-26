import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { musicians } from '~~/server/database/schema'

const LOOKING_FOR = ['gigs', 'collaborators', 'session_work', 'bandmates', 'representation', 'studio_time', 'mentorship'] as const

const Body = z.object({
  name: z.string().min(1).max(120),
  stageName: z.string().max(120).optional(),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
  actType: z.enum(['solo', 'band', 'duo', 'dj', 'producer', 'composer', 'ensemble', 'other']).default('solo'),
  genres: z.string().max(200).optional(),
  neighborhood: z.string().max(120).optional(),
  bio: z.string().max(2000).optional(),
  yearsActive: z.number().int().min(0).max(90).optional(),
  memberCount: z.number().int().min(1).max(200).optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  streamingUrl: z.string().url().optional().or(z.literal('')),
  socialUrl: z.string().url().optional().or(z.literal('')),
  pressKitUrl: z.string().url().optional().or(z.literal('')),
  lookingFor: z.array(z.enum(LOOKING_FOR)).default([]),
  availableForBooking: z.boolean().default(true),
  listed: z.boolean().default(true),
})

/** Public sign-up. Everything lands as `pending` and is invisible until reviewed. */
export default defineEventHandler(async (event) => {
  const body = Body.parse(await readBody(event))
  const db = useDb()
  const email = body.email.toLowerCase().trim()

  const [existing] = await db.select().from(musicians).where(eq(musicians.email, email)).limit(1)
  if (existing) {
    // Don't leak whether an address is registered, and don't create a duplicate.
    return { ok: true, status: existing.status, alreadyRegistered: true }
  }

  const [row] = await db.insert(musicians).values({
    ...body,
    email,
    websiteUrl: body.websiteUrl || null,
    streamingUrl: body.streamingUrl || null,
    socialUrl: body.socialUrl || null,
    pressKitUrl: body.pressKitUrl || null,
    lookingFor: body.lookingFor.join(','),
    status: 'pending',
  }).returning()

  await logAction(null, 'register', 'musician', row.id, body.stageName || body.name)
  return { ok: true, status: row.status, alreadyRegistered: false }
})
