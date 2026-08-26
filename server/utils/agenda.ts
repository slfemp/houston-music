/**
 * The standard order of business for a public board meeting. Every new meeting
 * is seeded with this skeleton so the procedural items are never forgotten -
 * the chair then inserts substantive items into Unfinished/New Business.
 */
export const STANDARD_AGENDA: Array<{
  kind: string
  title: string
  description?: string
  actionRequired?: boolean
  minutesAllotted?: number
}> = [
  { kind: 'call_to_order', title: 'Call to Order', minutesAllotted: 1 },
  { kind: 'roll_call', title: 'Roll Call and Establishment of Quorum', minutesAllotted: 3 },
  { kind: 'approval_of_agenda', title: 'Approval of the Agenda', actionRequired: true, minutesAllotted: 2 },
  { kind: 'approval_of_minutes', title: 'Approval of the Minutes of the Previous Meeting', actionRequired: true, minutesAllotted: 5 },
  {
    kind: 'public_comment',
    title: 'Public Comment',
    description: 'Members of the public may address the board. Speakers are allotted three minutes each. The board does not deliberate or act on items raised during public comment.',
    minutesAllotted: 15,
  },
  { kind: 'treasurer_report', title: "Treasurer's Report", actionRequired: true, minutesAllotted: 10 },
  { kind: 'report', title: "Chair's Report", minutesAllotted: 10 },
  { kind: 'report', title: 'Committee Reports', minutesAllotted: 15 },
  { kind: 'old_business', title: 'Unfinished Business', minutesAllotted: 20 },
  { kind: 'new_business', title: 'New Business', minutesAllotted: 20 },
  { kind: 'announcements', title: 'Announcements', minutesAllotted: 5 },
  { kind: 'adjournment', title: 'Adjournment', actionRequired: true, minutesAllotted: 1 },
]

/** Positions are spaced so items can be inserted between them without renumbering. */
export const POSITION_STEP = 100

/**
 * Renders display numbers for a printed agenda: top-level items get 1, 2, 3...
 * and items nested under a heading get 8.a, 8.b. Nesting is implied by an
 * item carrying the same `kind` as the preceding heading.
 */
export function numberAgenda<T extends { kind: string; position: number }>(items: T[]): Array<T & { itemNumber: string }> {
  const sorted = [...items].sort((a, b) => a.position - b.position)
  const out: Array<T & { itemNumber: string }> = []
  let top = 0
  let sub = 0
  let lastGroupKind: string | null = null

  const groupable = new Set(['old_business', 'new_business', 'report', 'consent', 'discussion', 'action'])

  for (const item of sorted) {
    const isGrouped = groupable.has(item.kind) && item.kind === lastGroupKind
    if (isGrouped) {
      sub += 1
      out.push({ ...item, itemNumber: `${top}.${String.fromCharCode(96 + sub)}` })
    } else {
      top += 1
      sub = 0
      lastGroupKind = groupable.has(item.kind) ? item.kind : null
      out.push({ ...item, itemNumber: String(top) })
    }
  }
  return out
}

/** Hours of public notice given, or null if the agenda has not been posted. */
export function noticeLeadHours(noticePostedAt: Date | null, startsAt: Date): number | null {
  if (!noticePostedAt) return null
  return Math.floor((startsAt.getTime() - noticePostedAt.getTime()) / 3_600_000)
}
