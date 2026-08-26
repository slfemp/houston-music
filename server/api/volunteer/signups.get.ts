import { eq, desc } from 'drizzle-orm'
import { volunteerSignups, volunteerOpportunities } from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
  await requireAgendaAccess(event)
  const db = useDb()
  const { opportunityId } = getQuery(event) as { opportunityId?: string }

  return db.select({
    id: volunteerSignups.id, name: volunteerSignups.name, email: volunteerSignups.email,
    phone: volunteerSignups.phone, organization: volunteerSignups.organization,
    message: volunteerSignups.message, status: volunteerSignups.status,
    createdAt: volunteerSignups.createdAt,
    opportunityId: volunteerSignups.opportunityId,
    opportunityTitle: volunteerOpportunities.title,
  }).from(volunteerSignups)
    .innerJoin(volunteerOpportunities, eq(volunteerSignups.opportunityId, volunteerOpportunities.id))
    .where(opportunityId ? eq(volunteerSignups.opportunityId, Number(opportunityId)) : undefined)
    .orderBy(desc(volunteerSignups.createdAt))
    .limit(500)
})
