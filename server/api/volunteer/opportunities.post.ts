import { z } from 'zod'
import { volunteerOpportunities } from '~~/server/database/schema'

const Body = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  location: z.string().optional(),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
  slots: z.number().int().positive().nullable().optional(),
  skillsWanted: z.string().optional(),
  contactEmail: z.string().email().optional(),
  published: z.boolean().default(false),
  closesAt: z.coerce.date().optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireAgendaAccess(event)
  const body = Body.parse(await readBody(event))
  const db = useDb()

  const [opp] = await db.insert(volunteerOpportunities).values(body).returning()
  await logAction(user.id, 'create', 'volunteer_opportunity', opp.id, body.title)
  return opp
})
