// Request an admin sign-in link. Only sends to emails in the admins table;
// always returns the same generic response so nobody can enumerate admins.
export default defineEventHandler(async (event) => {
  const db = getDatabase(event)

  if (!(await checkRateLimit(db, `magic:${clientIp(event)}`, 5, 10 * 60_000))) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests — try again shortly.' })
  }

  const body = await readBody<{ email?: string }>(event)
  const email = (body.email || '').trim().toLowerCase()
  if (!email.includes('@')) {
    throw createError({ statusCode: 400, statusMessage: 'A valid email is required.' })
  }

  const admin = await db.prepare('SELECT email FROM admins WHERE email = ?').bind(email).first<{ email: string }>()
  if (admin) {
    const token = generateId()
    const expires = new Date(Date.now() + 15 * 60_000).toISOString()
    await db.prepare('INSERT INTO magic_links (token, email, expires_at, used) VALUES (?, ?, ?, 0)')
      .bind(token, email, expires).run()

    const origin = getRequestURL(event).origin
    const link = `${origin}/api/auth/verify?token=${token}`
    await sendEmail(event, {
      to: email,
      subject: 'Your HMAB admin sign-in link',
      html: `<div style="font-family:-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2>Sign in to HMAB Admin</h2>
        <p>Click below to sign in. This link expires in 15 minutes.</p>
        <p><a href="${link}" style="display:inline-block;background:#22d3ee;color:#000;text-decoration:none;padding:12px 28px;border-radius:6px;font-weight:600">Sign In</a></p>
        <p style="color:#888;font-size:12px;margin-top:24px">If you didn't request this, ignore this email.</p>
      </div>`,
    }).catch((e) => console.error('magic-link email failed:', e))

    // DEV: no Resend key locally — surface the link (localhost only, never prod).
    if (isLocalRequest(event) && !cfEnv(event, 'NUXT_RESEND_API_KEY')) {
      return { ok: true, link }
    }
  }

  return { ok: true }
})
