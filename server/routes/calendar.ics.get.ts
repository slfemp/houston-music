import { toIcs } from '~~/server/utils/calendar'
import { publicEntries } from '~~/server/api/public/calendar.get'

/**
 * Subscribable calendar feed. Served as a route rather than under /api so the
 * URL people paste into Google or Apple Calendar ends in .ics, which several
 * clients require before they will treat it as a calendar.
 */
export default defineEventHandler(async (event) => {
  const entries = await publicEntries(
    new Date(Date.now() - 180 * 86_400_000),
    new Date(Date.now() + 365 * 86_400_000),
  )

  const origin = getRequestURL(event).origin
  const body = toIcs(entries, { name: 'Houston Music Advisory Board', origin })

  setHeader(event, 'content-type', 'text/calendar; charset=utf-8')
  setHeader(event, 'content-disposition', 'inline; filename="hmab.ics"')
  setHeader(event, 'cache-control', 'public, max-age=900')
  return body
})
