import { eq, desc, asc } from 'drizzle-orm'
import { members, users } from '~~/server/database/schema'
import { quorumFor, isRegularSeat } from '~~/server/utils/motions'

/** Roster with quorum math, which every meeting screen needs. */
export default defineEventHandler(async (event) => {
  await requireUser(event)
  const db = useDb()
  const { includePast } = getQuery(event)

  const rows = await db.select({
    id: members.id,
    userId: members.userId,
    name: users.name,
    email: users.email,
    role: users.role,
    position: members.position,
    organization: members.organization,
    title: members.title,
    seatNumber: members.seatNumber,
    termStart: members.termStart,
    termEnd: members.termEnd,
    seated: members.seated,
  }).from(members)
    .innerJoin(users, eq(members.userId, users.id))
    .orderBy(desc(members.seated), asc(members.seatNumber), asc(users.name))

  const roster = includePast ? rows : rows.filter(r => r.seated)
  const seatedRows = rows.filter(r => r.seated)
  // Alternates hold seats but are not part of the quorum denominator.
  const regularCount = seatedRows.filter(r => isRegularSeat(r.position)).length

  return {
    members: roster,
    seatedCount: seatedRows.length,
    regularSeats: regularCount,
    alternateSeats: seatedRows.length - regularCount,
    quorum: quorumFor(regularCount),
  }
})
