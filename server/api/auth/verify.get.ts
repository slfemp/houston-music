// Consume a magic link: validate the token, mint a session, land in the admin.
export default defineEventHandler(async (event) => {
  const token = (getQuery(event).token as string) || ''
  if (!token) throw createError({ statusCode: 400, statusMessage: 'Missing token' })

  const db = getDatabase(event)
  const link = await db
    .prepare('SELECT email, expires_at, used FROM magic_links WHERE token = ?')
    .bind(token)
    .first<{ email: string; expires_at: string; used: number }>()

  if (!link || link.used || new Date(link.expires_at) < new Date()) {
    throw createError({ statusCode: 400, statusMessage: 'This link is invalid or has expired.' })
  }

  await db.prepare('UPDATE magic_links SET used = 1 WHERE token = ?').bind(token).run()

  const admin = await db.prepare('SELECT email FROM admins WHERE email = ?').bind(link.email).first()
  if (!admin) throw createError({ statusCode: 400, statusMessage: 'No admin account for this email.' })

  const sessionId = generateId()
  await db.prepare('INSERT INTO sessions (id, email, expires_at) VALUES (?, ?, ?)')
    .bind(sessionId, link.email, sessionExpiresAt()).run()
  await createSessionCookie(event, sessionId)

  return sendRedirect(event, '/board')
})
