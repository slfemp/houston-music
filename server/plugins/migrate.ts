import { migrate } from 'drizzle-orm/libsql/migrator'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Applies pending migrations at boot. Safe to run repeatedly - drizzle records
 * what it has applied. Set SKIP_MIGRATIONS=1 to manage schema out of band.
 *
 * The folder is resolved from the working directory rather than import.meta.url
 * because the plugin is bundled into .nuxt/ in dev and .output/ in production,
 * so its own location tells us nothing useful about where the SQL lives.
 */
export default defineNitroPlugin(async () => {
  if (process.env.SKIP_MIGRATIONS) return

  const candidates = [
    process.env.MIGRATIONS_DIR,
    resolve(process.cwd(), 'server/database/migrations'),
    resolve(process.cwd(), '../server/database/migrations'),
  ].filter(Boolean) as string[]

  const folder = candidates.find(p => existsSync(p))
  if (!folder) {
    console.warn('[migrate] no migrations folder found; checked:', candidates.join(', '))
    return
  }

  try {
    await migrate(useDb(), { migrationsFolder: folder })
    console.log('[migrate] schema up to date')
  } catch (err) {
    console.error('[migrate] failed:', err)
    // Rethrow in production: serving requests against an unmigrated database
    // corrupts data more thoroughly than refusing to start.
    if (process.env.NODE_ENV === 'production') throw err
  }
})
