/** Shape shared by every calendar surface, whatever the underlying record is. */
export interface CalendarEntry {
  id: string
  kind: 'meeting' | 'event' | 'volunteer'
  title: string
  description?: string | null
  startsAt: Date
  endsAt?: Date | null
  allDay: boolean
  location?: string | null
  url?: string | null
  /** 'public' entries are safe to render anywhere; 'board' never leaves the console. */
  visibility: 'public' | 'board'
  category?: string | null
}

const pad = (n: number) => String(n).padStart(2, '0')

/** RFC 5545 UTC timestamp: 20260825T183000Z */
function icsStamp(d: Date): string {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
}

/**
 * Escapes per RFC 5545: backslash first (so it does not double-escape the
 * separators added after it), then the delimiters, then newlines.
 */
function esc(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

/** Folds long lines to 75 octets, continuation lines starting with a space. */
function fold(line: string): string {
  if (line.length <= 75) return line
  const out: string[] = [line.slice(0, 75)]
  let rest = line.slice(75)
  while (rest.length > 74) {
    out.push(' ' + rest.slice(0, 74))
    rest = rest.slice(74)
  }
  if (rest) out.push(' ' + rest)
  return out.join('\r\n')
}

export function toIcs(entries: CalendarEntry[], opts: { name: string, origin: string }): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Houston Music Advisory Board//Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${esc(opts.name)}`,
    'X-WR-TIMEZONE:America/Chicago',
  ]

  for (const e of entries) {
    const end = e.endsAt ?? new Date(e.startsAt.getTime() + 3_600_000)
    lines.push(
      'BEGIN:VEVENT',
      `UID:${e.kind}-${e.id}@houstonmusicadvisoryboard.com`,
      // A fixed stamp per entry keeps re-subscribes stable; startsAt is stable data.
      `DTSTAMP:${icsStamp(e.startsAt)}`,
      `DTSTART:${icsStamp(e.startsAt)}`,
      `DTEND:${icsStamp(end)}`,
      fold(`SUMMARY:${esc(e.title)}`),
    )
    if (e.description) lines.push(fold(`DESCRIPTION:${esc(e.description)}`))
    if (e.location) lines.push(fold(`LOCATION:${esc(e.location)}`))
    if (e.url) lines.push(fold(`URL:${esc(e.url)}`))
    lines.push(`CATEGORIES:${esc(e.kind === 'meeting' ? 'Board Meeting' : e.category || 'Event')}`)
    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')
  // RFC 5545 requires CRLF line endings.
  return lines.join('\r\n') + '\r\n'
}
