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

// Resolves the board user from the magic-link session (admins allowlist →
// users row by email). Password auth from the original console is gone.
export async function requireUser(event: any): Promise<BoardUser> {
  const admin = await currentAdmin(event)
  if (!admin) throw createError({ statusCode: 401, statusMessage: 'Not signed in' })
  const db = useDb()
  const [u] = await db.select().from(users)
    .where(and(eq(users.email, admin.email), eq(users.active, true))).limit(1)
  if (!u) throw createError({ statusCode: 403, statusMessage: 'No board account for this email' })
  return { id: u.id, email: u.email, name: u.name, role: u.role as Role }
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
