import { eq, and, sql, inArray } from 'drizzle-orm'
import { z } from 'zod'
import { volunteerOpportunities, volunteerSignups } from '~~/server/database/schema'

const Body = z.object({
  opportunityId: z.number().int(),
  name: z.string().min(1).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
  organization: z.string().max(160).optional(),
  message: z.string().max(2000).optional(),
})

/** Public endpoint - no auth. Full opportunities waitlist rather than reject. */
export default defineEventHandler(async (event) => {
  const body = Body.parse(await readBody(event))
  const db = useDb()

  const [opp] = await db.select().from(volunteerOpportunities)
    .where(eq(volunteerOpportunities.id, body.opportunityId)).limit(1)
  if (!opp || !opp.published) {
    throw createError({ statusCode: 404, statusMessage: 'That volunteer opportunity is not open' })
  }
  if (opp.closesAt && opp.closesAt.getTime() < Date.now()) {
    throw createError({ statusCode: 410, statusMessage: 'Sign-ups for this opportunity have closed' })
  }

  const email = body.email.toLowerCase().trim()
  const [existing] = await db.select().from(volunteerSignups)
    .where(and(eq(volunteerSignups.opportunityId, opp.id), eq(volunteerSignups.email, email))).limit(1)
  if (existing) {
    return { id: existing.id, status: existing.status, alreadySignedUp: true }
  }

  const [{ taken }] = await db.select({ taken: sql<number>`count(*)` })
    .from(volunteerSignups)
    .where(and(
      eq(volunteerSignups.opportunityId, opp.id),
      inArray(volunteerSignups.status, ['pending', 'confirmed']),
    ))

  const status = opp.slots != null && Number(taken) >= opp.slots ? 'waitlisted' as const : 'pending' as const

  const [signup] = await db.insert(volunteerSignups).values({
    opportunityId: opp.id,
    name: body.name.trim(),
    email,
    phone: body.phone,
    organization: body.organization,
    message: body.message,
    status,
  }).returning()

  await logAction(null, 'signup', 'volunteer_signup', signup.id, `${body.name} -> ${opp.title}`)
  return { id: signup.id, status, alreadySignedUp: false }
})
