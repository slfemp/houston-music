import { eq, and, gte, sql, desc, asc } from 'drizzle-orm'
import { volunteerOpportunities, volunteerSignups } from '~~/server/database/schema'

/** Public listing. Only published, still-open opportunities, with slots left. */
export default defineEventHandler(async (event) => {
  const db = useDb()
  const { all } = getQuery(event) as { all?: string }

  // The board console can ask for everything; the public page cannot.
  let includeUnpublished = false
  if (all) {
    await requireAgendaAccess(event)
    includeUnpublished = true
  }

  const rows = await db.select({
    id: volunteerOpportunities.id,
    title: volunteerOpportunities.title,
    description: volunteerOpportunities.description,
    location: volunteerOpportunities.location,
    startsAt: volunteerOpportunities.startsAt,
    endsAt: volunteerOpportunities.endsAt,
    slots: volunteerOpportunities.slots,
    skillsWanted: volunteerOpportunities.skillsWanted,
    contactEmail: volunteerOpportunities.contactEmail,
    published: volunteerOpportunities.published,
    closesAt: volunteerOpportunities.closesAt,
    taken: sql<number>`(select count(*) from ${volunteerSignups}
      where ${volunteerSignups.opportunityId} = ${volunteerOpportunities.id}
      and ${volunteerSignups.status} in ('pending','confirmed'))`,
  }).from(volunteerOpportunities)
    .where(includeUnpublished ? undefined : eq(volunteerOpportunities.published, true))
    .orderBy(asc(volunteerOpportunities.startsAt))

  const now = Date.now()
  return rows
    .filter(r => includeUnpublished || !r.closesAt || r.closesAt.getTime() > now)
    .map(r => ({
      ...r,
      taken: Number(r.taken),
      slotsRemaining: r.slots == null ? null : Math.max(0, r.slots - Number(r.taken)),
      full: r.slots != null && Number(r.taken) >= r.slots,
    }))
})
