import { eq, and, inArray } from 'drizzle-orm'
import { z } from 'zod'
import { motions, meetings, attendance, members, agendaItems } from '~~/server/database/schema'
import { MOTION_KINDS, MOTION_RULES, ruleFor, isRegularSeat, type MotionKind } from '~~/server/utils/motions'
import { requireStanding } from '~~/server/utils/quorum'

const Body = z.object({
  meetingId: z.number().int(),
  agendaItemId: z.number().int().optional(),
  kind: z.enum(MOTION_KINDS as [MotionKind, ...MotionKind[]]).default('main'),
  text: z.string().min(3),
  parentMotionId: z.number().int().optional(),
  relatedMeetingId: z.number().int().optional(),
  method: z.enum(['voice', 'roll_call', 'unanimous_consent', 'show_of_hands']).default('roll_call'),
})

/** Moves a question. Enforces quorum, standing, and Robert's Rules precedence. */
export default defineEventHandler(async (event) => {
  const { user, seat } = await requireSeat(event)
  const body = Body.parse(await readBody(event))
  const db = useDb()

  const [meeting] = await db.select().from(meetings).where(eq(meetings.id, body.meetingId)).limit(1)
  if (!meeting) throw createError({ statusCode: 404, statusMessage: 'Meeting not found' })
  if (meeting.status !== 'in_progress') {
    throw createError({ statusCode: 409, statusMessage: 'The board may only act while a meeting is in progress' })
  }

  // No quorum, no business. Also rejects an alternate who has not been seated.
  const q = await requireStanding(body.meetingId, seat.id, 'move a question')

  const rule = ruleFor(body.kind)

  // Precedence: while a question is pending, only a motion of higher rank may
  // be entertained. Two main motions cannot be pending at once.
  const pending = await db.select().from(motions).where(and(
    eq(motions.meetingId, body.meetingId),
    inArray(motions.status, ['proposed', 'seconded', 'debating', 'voting']),
  ))
  if (pending.length) {
    const highest = Math.max(...pending.map(m => MOTION_RULES[m.kind as MotionKind]?.rank ?? 0))
    if (rule.rank <= highest) {
      const blocking = pending.find(m => (MOTION_RULES[m.kind as MotionKind]?.rank ?? 0) === highest)!
      throw createError({
        statusCode: 409,
        statusMessage: `Out of order: "${MOTION_RULES[blocking.kind as MotionKind]?.label}" is pending. Only a motion of higher precedence may be made now.`,
      })
    }
  }

  const [motion] = await db.insert(motions).values({
    meetingId: body.meetingId,
    agendaItemId: body.agendaItemId,
    parentMotionId: body.parentMotionId ?? (rule.subsidiary ? pending.find(m => m.kind === 'main')?.id : undefined),
    relatedMeetingId: body.relatedMeetingId,
    kind: body.kind,
    text: body.text,
    movedByMemberId: seat.id,
    threshold: rule.threshold,
    method: body.method,
    status: rule.needsSecond ? 'proposed' : 'debating',
    // Regular seats only - the denominator a threshold is judged against.
    seatsAtVote: q.regularSeats,
  }).returning()

  await logAction(user.id, 'move', 'motion', motion.id, body.text.slice(0, 200))
  return { ...motion, rule }
})
