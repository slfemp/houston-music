import { sql, eq } from 'drizzle-orm'
import { z } from 'zod'
import { users, members, accounts } from '~~/server/database/schema'
import { boardMembers } from '~~/app/data/boardMembers'
import { quorumFor, isRegularSeat } from '~~/server/utils/motions'

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(12, 'Use at least 12 characters'),
  name: z.string().min(1).default('Administrator'),
  /** Seed the roster from the published board list. */
  seedRoster: z.boolean().default(true),
})

/**
 * First-run bootstrap. Creates the initial administrator and, optionally, the
 * board roster. Refuses to run once any account exists, so it cannot be used to
 * mint an admin on a live system.
 */
export default defineEventHandler(async (event) => {
  const db = useDb()

  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(users)
  if (Number(count) > 0) {
    throw createError({ statusCode: 409, statusMessage: 'Setup has already been completed' })
  }

  const body = Body.parse(await readBody(event))

  const [admin] = await db.insert(users).values({
    email: body.email.toLowerCase().trim(),
    name: body.name,
    role: 'admin',
    passwordHash: await hashPassword(body.password),
  }).returning()

  await db.insert(members).values({
    userId: admin.id, position: 'member', seatNumber: 0, seated: false,
    title: 'System administrator',
  })

  let seeded = 0
  if (body.seedRoster) {
    const positionMap: Record<string, 'chair' | 'vice_chair' | 'secretary' | 'treasurer' | 'member'> = {
      'Chair': 'chair',
      'Vice-Chair': 'vice_chair',
      'Secretary/Founder': 'secretary',
      'Treasurer': 'treasurer',
    }

    // Alternates are seated as 'alternate': they hold a seat but sit outside the
    // quorum denominator until the chair seats one for a specific meeting.
    const roster = [
      ...boardMembers.officers.map(m => ({ ...m, position: positionMap[m.position ?? ''] ?? 'member' as const })),
      ...boardMembers.members.map(m => ({ ...m, position: 'member' as const })),
      ...boardMembers.alternates.map(m => ({ ...m, position: 'alternate' as const })),
    ].filter(m => m.name && !m.name.startsWith('(Vacant'))

    let seat = 1
    for (const person of roster) {
      // Placeholder addresses: each member sets a real one when their account
      // is issued. Unique so the roster can be created before invitations go out.
      const slug = person.name.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '')
      const [u] = await db.insert(users).values({
        email: `${slug}@board.invalid`,
        name: person.name,
        role: person.position === 'member' ? 'member' : 'officer',
        passwordHash: await hashPassword(crypto.randomUUID()),
        active: false,
      }).returning()

      await db.insert(members).values({
        userId: u.id,
        position: person.position,
        organization: person.organization || null,
        title: (person as any).title || null,
        seatNumber: seat++,
        seated: true,
      })
      seeded++
    }
  }

  await db.insert(accounts).values({
    name: 'Operating Account',
    type: 'checking',
    openingBalanceCents: 0,
  })

  await logAction(admin.id, 'setup', 'system', admin.id, `seeded ${seeded} members`)

  const seatedNow = await db.select().from(members).where(eq(members.seated, true))
  const regularSeats = seatedNow.filter(m => isRegularSeat(m.position)).length

  return {
    ok: true,
    admin: { id: admin.id, email: admin.email },
    seatsCreated: seeded,
    regularSeats,
    alternateSeats: seatedNow.length - regularSeats,
    quorum: quorumFor(regularSeats),
    note: seeded
      ? 'Roster created with placeholder @board.invalid emails and inactive accounts. Set real addresses and issue passwords from Members before members can sign in.'
      : undefined,
  }
})
