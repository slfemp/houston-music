import { eq, asc } from 'drizzle-orm'
import { bookingVenues } from '~~/server/database/schema'

/** Public booking directory. Only published venues; unpublished are filtered in SQL. */
export default defineEventHandler(async () => {
  const db = useDb()

  const rows = await db.select().from(bookingVenues)
    .where(eq(bookingVenues.published, true))
    .orderBy(asc(bookingVenues.name))
    .limit(500)

  const PAY_LABEL: Record<string, string> = {
    guarantee: 'Guarantee',
    door_split: 'Door split',
    ticket_split: 'Ticket split',
    guarantee_plus_split: 'Guarantee + split',
    tips_only: 'Tips only',
    unpaid: 'Unpaid',
    varies: 'Varies',
  }

  return rows.map(v => ({
    ...v,
    genreList: v.genresBooked ? v.genresBooked.split(',').map(g => g.trim()).filter(Boolean) : [],
    paysLabel: PAY_LABEL[v.paysArtists] ?? 'Varies',
    // Surfaced so artists can judge how current the booking contact is.
    verifiedDaysAgo: v.verifiedAt ? Math.floor((Date.now() - v.verifiedAt.getTime()) / 86_400_000) : null,
  }))
})
