/**
 * Robert's Rules of Order, Newly Revised - the subset a municipal-style board
 * actually uses. This table is the single source of truth for whether a motion
 * needs a second, may be debated, and what it takes to carry.
 */

export type MotionKind =
  | 'main' | 'amend' | 'substitute' | 'postpone_definitely' | 'postpone_indefinitely'
  | 'refer_to_committee' | 'lay_on_table' | 'take_from_table' | 'previous_question'
  | 'limit_debate' | 'recess' | 'adjourn' | 'reconsider' | 'rescind' | 'suspend_rules'
  | 'approve_minutes' | 'approve_agenda' | 'approve_consent'
  | 'accept_report' | 'approve_expenditure' | 'approve_budget'

export type Threshold = 'majority' | 'two_thirds' | 'unanimous'

export interface MotionRule {
  label: string
  /** Precedence rank. A motion may only be made while a motion of LOWER rank is pending. */
  rank: number
  needsSecond: boolean
  debatable: boolean
  amendable: boolean
  threshold: Threshold
  /** Subsidiary/privileged motions attach to a pending motion. */
  subsidiary: boolean
  help: string
}

export const MOTION_RULES: Record<MotionKind, MotionRule> = {
  // --- Privileged: take precedence over everything ---
  adjourn: { label: 'Adjourn', rank: 60, needsSecond: true, debatable: false, amendable: false, threshold: 'majority', subsidiary: true, help: 'Ends the meeting. Not debatable.' },
  recess: { label: 'Recess', rank: 50, needsSecond: true, debatable: false, amendable: true, threshold: 'majority', subsidiary: true, help: 'Pauses the meeting for a stated time.' },

  // --- Subsidiary: applied to the pending main motion ---
  lay_on_table: { label: 'Lay on the Table', rank: 40, needsSecond: true, debatable: false, amendable: false, threshold: 'majority', subsidiary: true, help: 'Sets the question aside for urgent business. Not debatable.' },
  previous_question: { label: 'Previous Question (Call the Question)', rank: 30, needsSecond: true, debatable: false, amendable: false, threshold: 'two_thirds', subsidiary: true, help: 'Ends debate and forces an immediate vote. Requires two-thirds.' },
  limit_debate: { label: 'Limit or Extend Debate', rank: 30, needsSecond: true, debatable: false, amendable: true, threshold: 'two_thirds', subsidiary: true, help: 'Changes the time allowed for debate. Requires two-thirds.' },
  postpone_definitely: { label: 'Postpone to a Certain Time', rank: 20, needsSecond: true, debatable: true, amendable: true, threshold: 'majority', subsidiary: true, help: 'Defers the question to a stated later meeting.' },
  refer_to_committee: { label: 'Refer to Committee', rank: 20, needsSecond: true, debatable: true, amendable: true, threshold: 'majority', subsidiary: true, help: 'Sends the question to a committee for study.' },
  amend: { label: 'Amend', rank: 10, needsSecond: true, debatable: true, amendable: true, threshold: 'majority', subsidiary: true, help: 'Changes the wording of the pending motion.' },
  substitute: { label: 'Substitute', rank: 10, needsSecond: true, debatable: true, amendable: true, threshold: 'majority', subsidiary: true, help: 'Replaces the pending motion with different wording.' },
  postpone_indefinitely: { label: 'Postpone Indefinitely', rank: 5, needsSecond: true, debatable: true, amendable: false, threshold: 'majority', subsidiary: true, help: 'Kills the question without a direct vote on it.' },

  // --- Main and specific main motions ---
  main: { label: 'Main Motion', rank: 0, needsSecond: true, debatable: true, amendable: true, threshold: 'majority', subsidiary: false, help: 'Brings new business before the board.' },
  approve_agenda: { label: 'Approve the Agenda', rank: 0, needsSecond: true, debatable: true, amendable: true, threshold: 'majority', subsidiary: false, help: 'Adopts the order of business for this meeting.' },
  approve_minutes: { label: 'Approve the Minutes', rank: 0, needsSecond: true, debatable: true, amendable: true, threshold: 'majority', subsidiary: false, help: 'Adopts the minutes of a previous meeting as the official record.' },
  approve_consent: { label: 'Approve the Consent Agenda', rank: 0, needsSecond: true, debatable: true, amendable: true, threshold: 'majority', subsidiary: false, help: 'Adopts routine items in a single vote.' },
  accept_report: { label: 'Receive and File the Report', rank: 0, needsSecond: true, debatable: true, amendable: false, threshold: 'majority', subsidiary: false, help: 'Accepts a report into the record. Does not adopt its recommendations.' },
  approve_expenditure: { label: 'Approve Expenditure', rank: 0, needsSecond: true, debatable: true, amendable: true, threshold: 'majority', subsidiary: false, help: 'Authorizes spending. Cite this motion on the resulting transaction.' },
  approve_budget: { label: 'Adopt the Budget', rank: 0, needsSecond: true, debatable: true, amendable: true, threshold: 'majority', subsidiary: false, help: 'Adopts the budget for a fiscal year.' },

  // --- Bring back / restorative ---
  take_from_table: { label: 'Take from the Table', rank: 0, needsSecond: true, debatable: false, amendable: false, threshold: 'majority', subsidiary: false, help: 'Resumes a question previously laid on the table.' },
  reconsider: { label: 'Reconsider', rank: 0, needsSecond: true, debatable: true, amendable: false, threshold: 'majority', subsidiary: false, help: 'Reopens a decided question. Must be moved by someone on the prevailing side.' },
  rescind: { label: 'Rescind / Amend Something Previously Adopted', rank: 0, needsSecond: true, debatable: true, amendable: true, threshold: 'two_thirds', subsidiary: false, help: 'Undoes a past decision. Two-thirds without prior notice.' },
  suspend_rules: { label: 'Suspend the Rules', rank: 0, needsSecond: true, debatable: false, amendable: false, threshold: 'two_thirds', subsidiary: false, help: 'Sets aside a procedural rule for a specific purpose. Requires two-thirds.' },
}

export const MOTION_KINDS = Object.keys(MOTION_RULES) as MotionKind[]

export function ruleFor(kind: MotionKind): MotionRule {
  const rule = MOTION_RULES[kind]
  if (!rule) throw createError({ statusCode: 400, statusMessage: `Unknown motion type: ${kind}` })
  return rule
}

export interface Tally {
  ayes: number
  nays: number
  abstentions: number
  recusals: number
  absent: number
}

/**
 * Under Robert's Rules a "majority vote" means more than half of the votes
 * CAST - abstentions and recusals are not votes and never count against a
 * motion. A member who abstains still counts toward quorum.
 */
export function decideMotion(tally: Tally, threshold: Threshold): 'carried' | 'failed' {
  const cast = tally.ayes + tally.nays
  if (cast === 0) return 'failed'

  switch (threshold) {
    case 'majority':
      return tally.ayes * 2 > cast ? 'carried' : 'failed'
    case 'two_thirds':
      // ayes/cast >= 2/3, done in integers to avoid float rounding at the boundary
      return tally.ayes * 3 >= cast * 2 ? 'carried' : 'failed'
    case 'unanimous':
      return tally.nays === 0 && tally.ayes > 0 ? 'carried' : 'failed'
  }
}

export function describeThreshold(threshold: Threshold, tally: Tally): string {
  const cast = tally.ayes + tally.nays
  switch (threshold) {
    case 'majority': return `${tally.ayes} of ${cast} cast - needs more than ${Math.floor(cast / 2)}`
    case 'two_thirds': return `${tally.ayes} of ${cast} cast - needs at least ${Math.ceil((cast * 2) / 3)}`
    case 'unanimous': return `${tally.ayes} aye, ${tally.nays} nay - needs no votes against`
  }
}

/**
 * Quorum is a majority of the REGULAR seats on the board.
 *
 * Alternates are excluded from this denominator: they hold a seat but do not
 * enlarge the board. Counting them would raise the bar for quorum every time an
 * alternate was appointed, which is the opposite of what alternates are for.
 * Vacant regular seats still count - quorum is a majority of the seats that
 * exist, not of the seats currently filled.
 */
export function quorumFor(regularSeatCount: number): number {
  return Math.floor(regularSeatCount / 2) + 1
}

/** Positions that occupy a regular seat and count toward the quorum denominator. */
export const REGULAR_POSITIONS = ['chair', 'vice_chair', 'secretary', 'treasurer', 'member'] as const

export function isRegularSeat(position: string): boolean {
  return (REGULAR_POSITIONS as readonly string[]).includes(position)
}
