import { eq, and } from 'drizzle-orm'
import { members, users } from '../database/schema'

export type Role = 'admin' | 'officer' | 'member' | 'staff'

/** Ascending privilege. `staff` is deliberately outside this ladder. */
const RANK: Record<Role, number> = { staff: 0, member: 1, officer: 2, admin: 3 }

export interface BoardUser {
  id: number
  email: string
  name: string
  role: Role
}

export async function requireUser(event: any): Promise<BoardUser> {
  const session = await requireUserSession(event)
  const u = session.user as BoardUser | undefined
  if (!u?.id) throw createError({ statusCode: 401, statusMessage: 'Not signed in' })
  return u
}

/** Throws 403 unless the signed-in user is at or above `role`. */
export async function requireRole(event: any, role: Role): Promise<BoardUser> {
  const user = await requireUser(event)
  if (RANK[user.role] < RANK[role]) {
    throw createError({ statusCode: 403, statusMessage: `Requires ${role} privileges` })
  }
  return user
}

/** Staff can draft agendas and minutes but never vote, so they get their own gate. */
export async function requireAgendaAccess(event: any): Promise<BoardUser> {
  const user = await requireUser(event)
  if (user.role === 'member') {
    throw createError({ statusCode: 403, statusMessage: 'Requires officer or staff privileges' })
  }
  return user
}

/** The seated-member record for a user, or null if they hold no seat (so cannot vote). */
export async function seatFor(userId: number) {
  const db = useDb()
  const [seat] = await db.select().from(members)
    .where(and(eq(members.userId, userId), eq(members.seated, true))).limit(1)
  return seat ?? null
}

export async function requireSeat(event: any) {
  const user = await requireUser(event)
  const seat = await seatFor(user.id)
  if (!seat) throw createError({ statusCode: 403, statusMessage: 'Only seated board members may do this' })
  return { user, seat }
}

export async function logAction(userId: number | null, action: string, entity: string, entityId?: number, detail?: string) {
  const db = useDb()
  const { auditLog } = await import('../database/schema')
  await db.insert(auditLog).values({ userId, action, entity, entityId, detail })
}

export { users }
