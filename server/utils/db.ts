import type { H3Event } from 'h3'

export function getDatabase(event: H3Event): D1Database {
  const cf = (event.context as Record<string, any>).cloudflare
  if (!cf?.env?.DB) {
    throw createError({ statusCode: 500, statusMessage: 'D1 database binding not available' })
  }
  return cf.env.DB as D1Database
}

// Read a secret/env from the Cloudflare Worker env — works in dev (.dev.vars)
// and prod (Pages env/secrets). More reliable than runtimeConfig overrides,
// which don't populate under `wrangler pages dev`.
export function cfEnv(event: H3Event, key: string): string {
  const v = ((event.context as Record<string, any>).cloudflare?.env as Record<string, unknown> | undefined)?.[key]
  return typeof v === 'string' ? v : ''
}

export function generateId(): string {
  return crypto.randomUUID()
}

// Durable per-key rate limiter backed by D1. Atomic UPSERT + RETURNING so a
// concurrent burst can't slip through a read-then-write gap.
export async function checkRateLimit(db: D1Database, key: string, maxRequests: number, windowMs: number): Promise<boolean> {
  const now = Date.now()
  try {
    const row = await db
      .prepare(
        `INSERT INTO rate_limits (key, count, window_start) VALUES (?1, 1, ?2)
         ON CONFLICT(key) DO UPDATE SET
           count = CASE WHEN ?2 - rate_limits.window_start >= ?3 THEN 1 ELSE rate_limits.count + 1 END,
           window_start = CASE WHEN ?2 - rate_limits.window_start >= ?3 THEN ?2 ELSE rate_limits.window_start END
         RETURNING count`,
      )
      .bind(key, now, windowMs)
      .first<{ count: number }>()
    return (row?.count ?? 1) <= maxRequests
  } catch (err) {
    console.error('checkRateLimit D1 error:', err)
    return true // fail open — a transient D1 error must not lock admins out
  }
}

export function clientIp(event: H3Event): string {
  return (
    getHeader(event, 'cf-connecting-ip') ||
    (getHeader(event, 'x-forwarded-for') || '').split(',')[0].trim() ||
    'unknown'
  )
}
