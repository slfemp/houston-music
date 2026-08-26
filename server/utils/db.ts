import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from '../database/schema'

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

/**
 * One connection per server instance. Local dev uses a SQLite file; production
 * points DATABASE_URL at a libSQL/Turso URL, which works from serverless
 * functions where a long-lived TCP pool would not.
 */
export function useDb() {
  if (_db) return _db
  const url = process.env.DATABASE_URL || 'file:./.data/board.db'
  const client = createClient({
    url,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  })
  _db = drizzle(client, { schema })
  return _db
}

export { schema }
