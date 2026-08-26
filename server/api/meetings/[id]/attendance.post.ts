import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { meetings, attendance, members } from '~~/server/database/schema'

const Body = z.object({
  memberId: z.number().int(),
  status: z.enum(['present', 'remote', 'absent', 'excused', 'late']),
  note: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireRole(event, 'officer')
  const id = Number(getRouterParam(event, 'id'))
  const { memberId, status, note } = Body.parse(await readBody(event))
  const db = useDb()

  const [seat] = await db.select().from(members).where(eq(members.id, memberId)).limit(1)
  if (!seat) throw createError({ statusCode: 404, statusMessage: 'Member not found' })

  const counts = status === 'present' || status === 'remote' || status === 'late'
  await db.insert(attendance)
    .values({ meetingId: id, memberId, status, note, arrivedAt: counts ? new Date() : null })
    .onConflictDoUpdate({
      target: [attendance.meetingId, attendance.memberId],
      set: { status, note, arrivedAt: counts ? new Date() : null },
    })

  const [meeting] = await db.select().from(meetings).where(eq(meetings.id, id)).limit(1)
  const rows = await db.select().from(attendance).where(eq(attendance.meetingId, id))
  const present = rows.filter(a => ['present', 'remote', 'late'].includes(a.status)).length
  const required = meeting?.quorumRequired ?? 1

  await logAction(user.id, 'roll_call', 'meeting', id, `member ${memberId}: ${status}`)
  return { present, required, met: present >= required }
})
