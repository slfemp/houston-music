import { and, eq, asc } from 'drizzle-orm'
import { musicians } from '~~/server/database/schema'

/**
 * Public artist directory.
 *
 * The column list is the privacy boundary: email and phone are collected for
 * board use and are never selected here, so they cannot leak through a client
 * that forgets to filter them.
 */
export default defineEventHandler(async () => {
  const db = useDb()

  const rows = await db.select({
    id: musicians.id,
    name: musicians.name,
    stageName: musicians.stageName,
    actType: musicians.actType,
    genres: musicians.genres,
    neighborhood: musicians.neighborhood,
    bio: musicians.bio,
    yearsActive: musicians.yearsActive,
    memberCount: musicians.memberCount,
    websiteUrl: musicians.websiteUrl,
    streamingUrl: musicians.streamingUrl,
    socialUrl: musicians.socialUrl,
    availableForBooking: musicians.availableForBooking,
    lookingFor: musicians.lookingFor,
  }).from(musicians)
    .where(and(eq(musicians.status, 'approved'), eq(musicians.listed, true)))
    .orderBy(asc(musicians.stageName), asc(musicians.name))
    .limit(500)

  return rows.map(r => ({
    ...r,
    displayName: r.stageName || r.name,
    genreList: r.genres ? r.genres.split(',').map(g => g.trim()).filter(Boolean) : [],
    lookingForList: r.lookingFor ? r.lookingFor.split(',').map(g => g.trim()).filter(Boolean) : [],
  }))
})
