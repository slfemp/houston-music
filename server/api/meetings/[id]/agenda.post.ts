import { eq, asc, desc } from 'drizzle-orm'
import { z } from 'zod'
import { agendaItems, meetings, issues } from '~~/server/database/schema'
import { POSITION_STEP } from '~~/server/utils/agenda'

const Body = z.object({
  kind: z.enum([
    'call_to_order', 'roll_call', 'approval_of_agenda', 'approval_of_minutes',
    'public_comment', 'consent', 'report', 'treasurer_report', 'old_business',
    'new_business', 'discussion', 'action', 'announcements', 'executive_session', 'adjournment',
  ]).default('new_business'),
  title: z.string().min(1),
  description: z.string().optional(),
  issueId: z.number().int().optional(),
  presenterUserId: z.number().int().optional(),
  minutesAllotted: z.number().int().positive().optional(),
  actionRequired: z.boolean().default(false),
  /** Insert after this item; appends to the end when omitted. */
  afterItemId: z.number().int().optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireAgendaAccess(event)
  const meetingId = Number(getRouterParam(event, 'id'))
  const body = Body.parse(await readBody(event))
  const db = useDb()

  const [meeting] = await db.select().from(meetings).where(eq(meetings.id, meetingId)).limit(1)
  if (!meeting) throw createError({ statusCode: 404, statusMessage: 'Meeting not found' })

  const items = await db.select().from(agendaItems)
    .where(eq(agendaItems.meetingId, meetingId)).orderBy(asc(agendaItems.position))

  // Find a gap between neighbours so the rest of the agenda keeps its numbering.
  let position: number
  if (body.afterItemId) {
    const idx = items.findIndex(i => i.id === body.afterItemId)
    if (idx === -1) throw createError({ statusCode: 404, statusMessage: 'afterItemId is not on this agenda' })
    const before = items[idx].position
    const after = items[idx + 1]?.position ?? before + POSITION_STEP * 2
    position = Math.floor((before + after) / 2)
    if (position === before) {
      // Gap exhausted - respace the whole agenda, then append after the anchor.
      await Promise.all(items.map((it, i) =>
        db.update(agendaItems).set({ position: (i + 1) * POSITION_STEP }).where(eq(agendaItems.id, it.id))))
      position = (idx + 1) * POSITION_STEP + Math.floor(POSITION_STEP / 2)
    }
  } else {
    position = (items.at(-1)?.position ?? 0) + POSITION_STEP
  }

  const [item] = await db.insert(agendaItems).values({
    meetingId, position, kind: body.kind, title: body.title,
    description: body.description, issueId: body.issueId,
    presenterUserId: body.presenterUserId, minutesAllotted: body.minutesAllotted,
    actionRequired: body.actionRequired,
  }).returning()

  // Scheduling an issue moves it out of the backlog.
  if (body.issueId) {
    await db.update(issues).set({ status: 'scheduled', updatedAt: new Date() }).where(eq(issues.id, body.issueId))
  }

  await logAction(user.id, 'add_agenda_item', 'meeting', meetingId, body.title)
  return item
})
