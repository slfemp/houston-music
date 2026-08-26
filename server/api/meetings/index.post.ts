import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { meetings, agendaItems, members } from '~~/server/database/schema'
import { STANDARD_AGENDA, POSITION_STEP } from '~~/server/utils/agenda'
import { quorumFor, isRegularSeat } from '~~/server/utils/motions'

const Body = z.object({
  title: z.string().min(1),
  type: z.enum(['regular', 'special', 'committee', 'workshop', 'listening_session', 'emergency']).default('regular'),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date().optional(),
  location: z.string().min(1),
  virtualUrl: z.string().url().optional().or(z.literal('')),
  noticeRequiredHours: z.number().int().min(0).default(72),
  /** Seed the standard order of business. Off for informal workshops. */
  useStandardAgenda: z.boolean().default(true),
})

export default defineEventHandler(async (event) => {
  const user = await requireAgendaAccess(event)
  const body = Body.parse(await readBody(event))
  const db = useDb()

  const seated = await db.select().from(members).where(eq(members.seated, true))
  const regulars = seated.filter(m => isRegularSeat(m.position))

  const [meeting] = await db.insert(meetings).values({
    title: body.title,
    type: body.type,
    startsAt: body.startsAt,
    endsAt: body.endsAt,
    location: body.location,
    virtualUrl: body.virtualUrl || null,
    noticeRequiredHours: body.noticeRequiredHours,
    seatsAtNotice: regulars.length,
    quorumRequired: quorumFor(regulars.length),
    status: 'draft',
  }).returning()

  if (body.useStandardAgenda) {
    await db.insert(agendaItems).values(
      STANDARD_AGENDA.map((item, i) => ({
        meetingId: meeting.id,
        position: (i + 1) * POSITION_STEP,
        kind: item.kind as any,
        title: item.title,
        description: item.description,
        actionRequired: item.actionRequired ?? false,
        minutesAllotted: item.minutesAllotted,
      })),
    )
  }

  await logAction(user.id, 'create', 'meeting', meeting.id, body.title)
  return meeting
})
