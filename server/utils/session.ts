import type { H3Event } from 'h3'

const COOKIE_NAME = 'hmab_admin_session'
const SESSION_TTL_DAYS = 30
const encoder = new TextEncoder()

// Dev bypasses honored ONLY on localhost — prod is never localhost, so a
// leaked bypass env var can never disable auth on the real domain.
export function isLocalRequest(event: H3Event): boolean {
  try {
    const host = getRequestURL(event).hostname
    return host === 'localhost' || host === '127.0.0.1' || host === '::1'
  } catch {
    return false
  }
}

async function hmacSign(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(message))
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function createSessionCookie(event: H3Event, sessionId: string): Promise<void> {
  const expires = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000)
  const signature = await hmacSign(cfEnv(event, 'NUXT_SESSION_SECRET'), sessionId)
  setCookie(event, COOKIE_NAME, `${sessionId}.${signature}`, {
    httpOnly: true, secure: true, sameSite: 'lax', path: '/', expires,
  })
}

export async function readSessionCookie(event: H3Event): Promise<string | null> {
  const cookie = getCookie(event, COOKIE_NAME)
  if (!cookie) return null
  const dot = cookie.lastIndexOf('.')
  if (dot === -1) return null
  const sessionId = cookie.slice(0, dot)
  const signature = cookie.slice(dot + 1)
  return (await hmacSign(cfEnv(event, 'NUXT_SESSION_SECRET'), sessionId)) === signature ? sessionId : null
}

export function clearSessionCookie(event: H3Event): void {
  deleteCookie(event, COOKIE_NAME, { httpOnly: true, secure: true, sameSite: 'lax', path: '/' })
}

export function sessionExpiresAt(): string {
  return new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString()
}

export interface AdminUser { email: string; name: string }

// Resolve the current admin from the session cookie, or null.
export async function currentAdmin(event: H3Event): Promise<AdminUser | null> {
  const db = getDatabase(event)

  const sessionId = await readSessionCookie(event)
  if (sessionId) {
    const row = await db
      .prepare(
        `SELECT a.email, a.name FROM sessions s
           JOIN admins a ON a.email = s.email
          WHERE s.id = ? AND s.expires_at > datetime('now')`,
      )
      .bind(sessionId)
      .first<AdminUser>()
    if (row) return row
  }

  // DEV auto-login: NUXT_DEV_AUTOLOGIN=<email> in .dev.vars, localhost only.
  const devEmail = cfEnv(event, 'NUXT_DEV_AUTOLOGIN')
  if (devEmail && isLocalRequest(event)) {
    const dev = await db.prepare('SELECT email, name FROM admins WHERE email = ?')
      .bind(devEmail.trim().toLowerCase())
      .first<AdminUser>()
    if (dev) return dev
  }

  return null
}

// Guard for admin API routes — throws 401 unless signed in.
export async function requireAdmin(event: H3Event): Promise<AdminUser> {
  const admin = await currentAdmin(event)
  if (!admin) throw createError({ statusCode: 401, statusMessage: 'Sign-in required' })
  return admin
}
