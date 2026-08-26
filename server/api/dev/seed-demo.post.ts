import { eq, sql } from 'drizzle-orm'
import {
  users, members, meetings, agendaItems, attendance, motions, votes,
  issues, issueSupport, accounts, transactions, budgetLines, treasurerReports,
  events, eventRsvps, merchItems, volunteerOpportunities, volunteerSignups,
  musicians, bookingVenues, users,
} from '~~/server/database/schema'
import { boardMembers } from '~~/app/data/boardMembers'
import { STANDARD_AGENDA, POSITION_STEP } from '~~/server/utils/agenda'
import { decideMotion, quorumFor, isRegularSeat, type Threshold } from '~~/server/utils/motions'
import { dollarsToCents } from '~~/server/utils/money'

/**
 * Fills the site with realistic demo content. Dev-only: `import.meta.dev`
 * compiles to false in production, so this handler is dead code there.
 *
 * Content is grounded in the real Houston scene - actual venues from the site's
 * own directory, real funding mechanisms (MOCA hotel-occupancy-tax grants
 * administered by Houston Arts Alliance), and real partner organisations.
 */
export default defineEventHandler(async (event) => {
  if (!import.meta.dev) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  const db = useDb()
  const day = 86_400_000
  const now = Date.now()
  const at = (days: number, hour = 18, min = 0) => {
    const d = new Date(now + days * day)
    d.setHours(hour, min, 0, 0)
    return d
  }

  let allSeated = await db.select().from(members).where(eq(members.seated, true))

  // Build the roster if one is missing. /api/setup only runs on a virgin
  // database, so after a reset that keeps the local admin it refuses - the
  // seeder has to be able to stand the board up on its own.
  if (allSeated.length < 3) {
    const positionMap: Record<string, 'chair' | 'vice_chair' | 'secretary' | 'treasurer' | 'member'> = {
      'Chair': 'chair', 'Vice-Chair': 'vice_chair',
      'Secretary/Founder': 'secretary', 'Treasurer': 'treasurer',
    }
    const roster = [
      ...boardMembers.officers.map((m: any) => ({ ...m, pos: positionMap[m.position ?? ''] ?? 'member' })),
      ...boardMembers.members.map((m: any) => ({ ...m, pos: 'member' })),
      ...boardMembers.alternates.map((m: any) => ({ ...m, pos: 'alternate' })),
    ].filter((m: any) => m.name && !m.name.startsWith('(Vacant'))

    let seatNo = 1
    for (const person of roster) {
      const slug = String(person.name).toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '')
      const email = `${slug}@board.invalid`
      let [u] = await db.select().from(users).where(eq(users.email, email)).limit(1)
      if (!u) {
        ;[u] = await db.insert(users).values({
          email, name: person.name,
          role: person.pos === 'member' || person.pos === 'alternate' ? 'member' : 'officer',
          passwordHash: await hashPassword(crypto.randomUUID()),
          active: false,
        }).returning()
      }
      await db.insert(members).values({
        userId: u.id, position: person.pos as any,
        organization: person.organization || null,
        seatNumber: seatNo++, seated: true,
      })
    }
    allSeated = await db.select().from(members).where(eq(members.seated, true))
  }
  // Attendance and voting are seeded against regular seats; alternates only act
  // when the chair seats them, which the demo leaves for the user to exercise.
  const seated = allSeated.filter(m => isRegularSeat(m.position))
  const quorum = quorumFor(seated.length)
  const [firstUser] = await db.select().from(users).limit(1)

  /* ---------------- Finance ---------------- */
  // Create the operating account if a prior reset removed it, so the seeder
  // does not depend on /api/setup having run immediately before it.
  let [operating] = await db.select().from(accounts).limit(1)
  if (!operating) {
    ;[operating] = await db.insert(accounts).values({
      name: 'Operating Account', type: 'checking', openingBalanceCents: 0,
    }).returning()
  }
  const [grantAcct] = await db.insert(accounts).values({
    name: 'MOCA Grant — FY26 Programming',
    type: 'grant',
    institution: 'Amegy Bank',
    lastFour: '4417',
    openingBalanceCents: 0,
    restrictedPurpose: 'Public programming and artist stipends under the FY26 MOCA award',
  }).returning()
  const [reserve] = await db.insert(accounts).values({
    name: 'Board Reserve',
    type: 'reserve',
    institution: 'Amegy Bank',
    lastFour: '9082',
    openingBalanceCents: dollarsToCents('12500.00'),
  }).returning()

  await db.update(accounts)
    .set({ institution: 'Amegy Bank', lastFour: '2231', openingBalanceCents: dollarsToCents('8420.00') })
    .where(eq(accounts.id, operating.id))

  const fy = new Date().getFullYear()
  await db.insert(budgetLines).values([
    { fiscalYear: fy, category: 'grants', kind: 'income', amountCents: dollarsToCents('75000'), note: 'MOCA + BANF' },
    { fiscalYear: fy, category: 'donations', kind: 'income', amountCents: dollarsToCents('15000') },
    { fiscalYear: fy, category: 'merchandise', kind: 'income', amountCents: dollarsToCents('4000') },
    { fiscalYear: fy, category: 'programs', kind: 'expense', amountCents: dollarsToCents('38000'), note: 'Showcases, workshops, listening sessions' },
    { fiscalYear: fy, category: 'stipends', kind: 'expense', amountCents: dollarsToCents('24000'), note: 'Artist and panelist stipends' },
    { fiscalYear: fy, category: 'marketing', kind: 'expense', amountCents: dollarsToCents('9000') },
    { fiscalYear: fy, category: 'events', kind: 'expense', amountCents: dollarsToCents('12000') },
    { fiscalYear: fy, category: 'software', kind: 'expense', amountCents: dollarsToCents('2400') },
    { fiscalYear: fy, category: 'professional_fees', kind: 'expense', amountCents: dollarsToCents('6000') },
  ])

  const txns: any[] = [
    ['income', 'grants', '45000.00', 'City of Houston MOCA', 'FY26 arts & culture award (hotel occupancy tax)', -160, grantAcct.id],
    ['income', 'grants', '18000.00', 'BIPOC Arts Network & Fund', 'BANF artist leadership award', -120, grantAcct.id],
    ['income', 'donations', '5000.00', 'Houston Music Foundation', 'Partner contribution — crisis relief co-fund', -95, operating.id],
    ['income', 'sponsorship', '3500.00', 'White Oak Music Hall', 'Showcase series sponsorship', -78, operating.id],
    ['income', 'donations', '1250.00', 'Individual donors', 'Q3 online giving', -55, operating.id],
    ['income', 'merchandise', '840.00', 'Merch sales', 'Hip Hop Vintage Flea Market pop-up', -41, operating.id],
    ['income', 'ticket_sales', '2200.00', 'Eventbrite', 'Listening session ticket sales', -33, operating.id],
    ['income', 'merchandise', '615.00', 'Merch sales', 'Cactus Music in-store', -18, operating.id],
    ['expense', 'stipends', '4500.00', 'Panelist stipends', '9 panelists × $500 — Fall listening session', -88, grantAcct.id],
    ['expense', 'programs', '6200.00', 'The Heights Theater', 'Venue rental — Emerging Artist Showcase', -72, grantAcct.id],
    ['expense', 'marketing', '1850.00', 'Sawyer Yards Print Co.', 'Posters, flyers, and street team materials', -66, operating.id],
    ['expense', 'events', '2400.00', 'Sound & Light Co.', 'Audio engineering and backline', -64, grantAcct.id],
    ['expense', 'stipends', '3000.00', 'Artist stipends', '6 performers × $500 — Showcase', -63, grantAcct.id],
    ['expense', 'supplies', '412.00', 'Amazon Business', 'Registration tablets, lanyards, signage', -58, operating.id],
    ['expense', 'software', '600.00', 'Various', 'Annual site, email, and ticketing tooling', -50, operating.id],
    ['expense', 'professional_fees', '2500.00', 'Ortiz & Associates CPA', 'FY25 financial review', -44, operating.id],
    ['expense', 'programs', '3800.00', 'Community Music Center of Houston', 'Youth workshop series — 4 sessions', -38, grantAcct.id],
    ['expense', 'travel', '680.00', 'Board travel', 'SXSW civic delegation — 2 members', -30, operating.id],
    ['expense', 'marketing', '950.00', 'Meta / Instagram', 'Showcase promotion', -27, operating.id],
    ['expense', 'events', '1500.00', 'Mo Better Brews', 'Listening session hosting and catering', -22, operating.id],
    ['expense', 'insurance', '1150.00', 'Hartford', 'General liability — annual', -16, operating.id],
    ['expense', 'stipends', '1500.00', 'Workshop instructors', '3 instructors × $500', -12, grantAcct.id],
    ['expense', 'supplies', '285.00', 'Cactus Music', 'Vinyl and merch for raffle', -8, operating.id],
    ['expense', 'bank_fees', '45.00', 'Amegy Bank', 'Monthly account fees', -5, operating.id],
    ['expense', 'programs', '2750.00', 'SwishaHouse Studios', 'Recording time — youth program participants', -3, grantAcct.id],
  ]

  for (const [type, category, amount, payee, memo, daysAgo, accountId] of txns) {
    const magnitude = Math.abs(dollarsToCents(amount as string))
    await db.insert(transactions).values({
      accountId: accountId as number,
      occurredOn: new Date(now + (daysAgo as number) * day),
      amountCents: type === 'income' ? magnitude : -magnitude,
      type: type as any,
      category: category as any,
      payee: payee as string,
      memo: memo as string,
      enteredByUserId: firstUser?.id,
      reconciledAt: (daysAgo as number) < -30 ? new Date(now + ((daysAgo as number) + 10) * day) : null,
    })
  }

  /* ---------------- Issues ---------------- */
  const issueSeed = [
    ['Establish musician load-in zones downtown', 'Performing artists routinely receive citations while loading gear outside downtown venues. Request that the board recommend designated 30-minute musician load zones near venues on Main, Congress, and Washington, modeled on the approach Austin and Nashville use.', 'advocacy', 'high', 'under_review'],
    ['Affordable rehearsal space inventory', 'There is no current inventory of affordable rehearsal and recording space inside the Loop. Propose a survey of existing facilities and a recommendation for a subsidized rehearsal space pilot.', 'venues', 'high', 'under_review'],
    ['Simplify MOCA grant application for individual artists', 'Individual artists report the application burden is disproportionate to award size. Recommend a short-form application for awards under $5,000.', 'funding', 'urgent', 'under_review'],
    ['Music education pipeline with HISD', 'Explore a formal partnership connecting HISD music programs to working Houston musicians for masterclasses and mentorship.', 'education', 'normal', 'submitted'],
    ['Sound ordinance review for live venues', 'Several small venues report inconsistent enforcement of the noise ordinance. Request clarification and a consistent enforcement standard.', 'policy', 'high', 'submitted'],
    ['Annual Houston music census', 'No reliable count exists of working musicians, venues, studios, and support businesses. A census would ground future funding decisions in data rather than familiarity.', 'policy', 'normal', 'scheduled'],
    ['Health-care navigation resources for working musicians', 'Partner with Houston Music Foundation to publish a plain-language guide to health coverage options for self-employed musicians.', 'advocacy', 'normal', 'submitted'],
    ['Venue accessibility audit', 'Survey member venues for ADA accessibility and publish a public accessibility guide for audiences.', 'venues', 'normal', 'submitted'],
    ['Bilingual outreach for board programming', 'All board communications are currently English-only, which excludes a substantial part of the local music community. Recommend Spanish translation for public notices and applications.', 'internal', 'high', 'under_review'],
    ['Late-night transit for venue workers', 'Venue and hospitality staff finishing after midnight have no reliable transit option. Raise with METRO as a workforce issue.', 'advocacy', 'normal', 'submitted'],
    ['Recording rights workshop series', 'Many emerging artists sign agreements without understanding master and publishing splits. Propose a recurring free workshop with a music attorney.', 'education', 'normal', 'resolved'],
    ['Small-venue insurance cost relief', 'Independent venues report liability insurance premiums rising faster than revenue. Investigate a group policy or city-supported pool.', 'venues', 'low', 'deferred'],
  ]

  const createdIssues: any[] = []
  for (const [i, [title, description, category, priority, status]] of issueSeed.entries()) {
    const [row] = await db.insert(issues).values({
      title: title as string,
      description: description as string,
      category: category as any,
      priority: priority as any,
      status: status as any,
      submittedByUserId: seated[i % seated.length].userId,
      createdAt: new Date(now - (60 - i * 4) * day),
      updatedAt: new Date(now - (30 - i * 2) * day),
    }).returning()
    createdIssues.push(row)

    // Vary support so the backlog ranks meaningfully.
    const supporters = seated.slice(0, ((i * 3) % seated.length) + 1)
    for (const s of supporters) {
      await db.insert(issueSupport).values({ issueId: row.id, userId: s.userId }).onConflictDoNothing()
    }
  }

  /* ---------------- Meetings ---------------- */
  async function buildMeeting(opts: {
    title: string, daysOffset: number, status: 'noticed' | 'adjourned' | 'draft',
    location: string, minutesStatus?: 'none' | 'draft' | 'approved', minutesBody?: string,
    motionSpecs?: Array<{ kind: string, text: string, threshold?: Threshold, ayes: number, nays: number, abstain: number }>,
  }) {
    const startsAt = at(opts.daysOffset, 18, 30)
    const [m] = await db.insert(meetings).values({
      title: opts.title,
      type: 'regular',
      status: opts.status,
      startsAt,
      location: opts.location,
      virtualUrl: 'https://houstontx.new.swagit.com/views/113',
      noticePostedAt: opts.status === 'draft' ? null : new Date(startsAt.getTime() - 5 * day),
      noticeRequiredHours: 72,
      seatsAtNotice: seated.length,
      quorumRequired: quorum,
      calledToOrderAt: opts.status === 'adjourned' ? startsAt : null,
      adjournedAt: opts.status === 'adjourned' ? new Date(startsAt.getTime() + 5_400_000) : null,
      minutesStatus: opts.minutesStatus ?? 'none',
      minutesBody: opts.minutesBody ?? null,
    }).returning()

    await db.insert(agendaItems).values(
      STANDARD_AGENDA.map((item, i) => ({
        meetingId: m.id,
        position: (i + 1) * POSITION_STEP,
        kind: item.kind as any,
        title: item.title,
        description: item.description,
        actionRequired: item.actionRequired ?? false,
        minutesAllotted: item.minutesAllotted,
        status: (opts.status === 'adjourned' ? 'completed' : 'pending') as any,
      })),
    )

    if (opts.status !== 'draft') {
      // Most members present; a couple absent or excused for realism.
      await db.insert(attendance).values(seated.map((s, i) => ({
        meetingId: m.id,
        memberId: s.id,
        status: (i === seated.length - 1 ? 'excused' : i === seated.length - 2 ? 'remote' : 'present') as any,
        arrivedAt: i < seated.length - 1 ? startsAt : null,
      })))
    }

    for (const spec of opts.motionSpecs ?? []) {
      const tally = { ayes: spec.ayes, nays: spec.nays, abstentions: spec.abstain, recusals: 0, absent: 1 }
      const threshold = spec.threshold ?? 'majority'
      const outcome = decideMotion(tally, threshold)

      const [motion] = await db.insert(motions).values({
        meetingId: m.id,
        kind: spec.kind as any,
        text: spec.text,
        movedByMemberId: seated[0].id,
        secondedByMemberId: seated[1].id,
        threshold,
        method: 'roll_call',
        status: outcome,
        ...tally,
        seatsAtVote: seated.length,
        openedAt: startsAt,
        closedAt: new Date(startsAt.getTime() + 600_000),
      }).returning()

      // Write a roll call consistent with the recorded tally.
      const voters = seated.slice(0, spec.ayes + spec.nays + spec.abstain)
      for (const [i, v] of voters.entries()) {
        const choice = i < spec.ayes ? 'aye' : i < spec.ayes + spec.nays ? 'nay' : 'abstain'
        await db.insert(votes).values({ motionId: motion.id, memberId: v.id, choice: choice as any }).onConflictDoNothing()
      }
    }
    return m
  }

  await buildMeeting({
    title: 'Regular Meeting of the Board — Q2',
    daysOffset: -74, status: 'adjourned', minutesStatus: 'approved',
    location: 'City Hall Annex, 900 Bagby St, Room 106, Houston, TX 77002',
    minutesBody: `The Regular Meeting of the Houston Music Advisory Board was called to order at 6:30 p.m. by the Chair. Roll was called and a quorum was present.\n\nThe agenda was approved as presented. The minutes of the previous regular meeting were approved as written.\n\nPublic comment: four speakers addressed the board regarding downtown parking enforcement during load-in, rehearsal space costs, and the grant application timeline.\n\nThe Treasurer presented the report for the period. The report was received and filed.\n\nUnder New Business, the board considered a recommendation to the Music Officer regarding designated musician load zones. Discussion centered on venue density along Main Street and precedent from other cities. The motion carried.\n\nThe board adjourned at 8:00 p.m.`,
    motionSpecs: [
      { kind: 'approve_agenda', text: 'I move that the agenda be approved as presented.', ayes: 7, nays: 0, abstain: 0 },
      { kind: 'approve_minutes', text: 'I move that the minutes of the previous regular meeting be approved as written.', ayes: 7, nays: 0, abstain: 0 },
      { kind: 'accept_report', text: "I move that the Treasurer's Report be received and filed.", ayes: 7, nays: 0, abstain: 0 },
      { kind: 'main', text: 'I move that the board recommend to the Music Officer that the City designate 30-minute musician load zones adjacent to permitted live music venues on Main Street, Congress Avenue, and Washington Avenue.', ayes: 6, nays: 1, abstain: 0 },
    ],
  })

  await buildMeeting({
    title: 'Special Meeting — FY26 Grant Recommendations',
    daysOffset: -41, status: 'adjourned', minutesStatus: 'approved',
    location: 'Mo Better Brews, 2409 Grant St, Houston, TX 77006',
    minutesBody: `A Special Meeting of the Houston Music Advisory Board was called to order at 6:30 p.m. Roll was called and a quorum was present.\n\nThe sole item of business was the board's recommendation on the FY26 individual artist grant structure.\n\nAfter discussion, a motion to recommend a short-form application for awards under $5,000 was made and seconded. Two members spoke against on the grounds that a shorter form may reduce reviewers' ability to assess impact. The motion carried.\n\nA motion to approve programming expenditure for the Fall showcase series carried unanimously.\n\nThe board adjourned at 7:45 p.m.`,
    motionSpecs: [
      { kind: 'approve_agenda', text: 'I move that the agenda be approved as presented.', ayes: 7, nays: 0, abstain: 0 },
      { kind: 'main', text: 'I move that the board recommend to the Mayor\'s Office of Cultural Affairs that a short-form application be adopted for individual artist awards under $5,000.', ayes: 5, nays: 2, abstain: 0 },
      { kind: 'approve_expenditure', text: 'I move that the board approve expenditure of up to $12,000 from the FY26 MOCA grant account for the Fall Emerging Artist Showcase series.', ayes: 7, nays: 0, abstain: 0 },
      { kind: 'previous_question', text: 'I move the previous question.', threshold: 'two_thirds', ayes: 6, nays: 1, abstain: 0 },
    ],
  })

  await buildMeeting({
    title: 'Regular Meeting of the Board — Q3',
    daysOffset: -12, status: 'adjourned', minutesStatus: 'draft',
    location: 'City Hall Annex, 900 Bagby St, Room 106, Houston, TX 77002',
    minutesBody: `DRAFT — pending board approval.\n\nThe Regular Meeting was called to order at 6:30 p.m. Roll was called and a quorum was present.\n\nPublic comment: three speakers addressed the board on late-night transit for venue workers and on bilingual access to board materials.\n\nThe Treasurer presented the report for the period ending last month. The report was received and filed.\n\nUnder New Business the board voted to commission an annual Houston music census. A motion to refer the venue accessibility audit to committee carried.\n\nThe board adjourned at 8:10 p.m.`,
    motionSpecs: [
      { kind: 'approve_agenda', text: 'I move that the agenda be approved as presented.', ayes: 7, nays: 0, abstain: 0 },
      { kind: 'accept_report', text: "I move that the Treasurer's Report be received and filed.", ayes: 6, nays: 0, abstain: 1 },
      { kind: 'main', text: 'I move that the board commission an annual Houston music census counting working musicians, venues, studios, and music-support businesses, and that the results inform future funding recommendations.', ayes: 7, nays: 0, abstain: 0 },
      { kind: 'refer_to_committee', text: 'I move that the venue accessibility audit be referred to the Venues Committee for study and report at the next regular meeting.', ayes: 6, nays: 1, abstain: 0 },
      { kind: 'main', text: 'I move that the board recommend a citywide cap on venue sound-ordinance fines pending the policy review.', ayes: 2, nays: 5, abstain: 0 },
      { kind: 'suspend_rules', text: 'I move to suspend the rules to take up the transit item out of order.', threshold: 'two_thirds', ayes: 4, nays: 3, abstain: 0 },
    ],
  })

  const upcoming = await buildMeeting({
    title: 'Regular Meeting of the Board — Q4',
    daysOffset: 9, status: 'noticed',
    location: 'City Hall Annex, 900 Bagby St, Room 106, Houston, TX 77002',
  })

  // Put real backlog items on the upcoming agenda.
  const lastPos = (await db.select().from(agendaItems).where(eq(agendaItems.meetingId, upcoming.id))).length
  await db.insert(agendaItems).values([
    {
      meetingId: upcoming.id, position: (lastPos + 1) * POSITION_STEP, kind: 'new_business',
      title: 'Affordable rehearsal space pilot — committee recommendation',
      description: 'Venues Committee to present findings on rehearsal and recording space costs inside the Loop, with a recommendation on a subsidized pilot.',
      issueId: createdIssues[1]?.id, actionRequired: true, minutesAllotted: 20,
    },
    {
      meetingId: upcoming.id, position: (lastPos + 2) * POSITION_STEP, kind: 'new_business',
      title: 'Bilingual access to board materials',
      description: 'Recommendation that all public notices, agendas, and application materials be published in Spanish alongside English.',
      issueId: createdIssues[8]?.id, actionRequired: true, minutesAllotted: 15,
    },
  ])

  await buildMeeting({
    title: 'Venues Committee — Working Session',
    daysOffset: 24, status: 'draft',
    location: 'White Oak Music Hall, 2915 N Main St, Houston, TX 77009',
  })

  /* ---------------- Treasurer's report ---------------- */
  const allTx = await db.select().from(transactions)
  const periodStart = new Date(now - 45 * day)
  const periodEnd = new Date(now - 12 * day)
  const before = allTx.filter(t => t.occurredOn < periodStart).reduce((s, t) => s + t.amountCents, 0)
  const inPeriod = allTx.filter(t => t.occurredOn >= periodStart && t.occurredOn <= periodEnd)
  const opening = dollarsToCents('8420.00') + dollarsToCents('12500.00') + before
  const income = inPeriod.filter(t => t.amountCents > 0).reduce((s, t) => s + t.amountCents, 0)
  const expense = inPeriod.filter(t => t.amountCents < 0).reduce((s, t) => s + t.amountCents, 0)

  await db.insert(treasurerReports).values({
    periodStart, periodEnd,
    openingBalanceCents: opening,
    incomeCents: income,
    expenseCents: Math.abs(expense),
    closingBalanceCents: opening + income + expense,
    narrative: 'Grant funds from the FY26 MOCA award and the BANF artist leadership award were received in full. Programming spend is tracking to budget. The Fall showcase series accounts for the majority of period expenditure.',
    preparedByUserId: firstUser?.id,
  })

  /* ---------------- Events ---------------- */
  const eventSeed: any[] = [
    ['Fall Emerging Artist Showcase', 'Eight Houston artists across hip hop, Latin, blues, and indie take the stage for a night built to put local talent in front of industry, press, and fans. Free to the public.', 'showcase', 'public', true, 16, 'The Heights Theater, 339 W 19th St, Houston, TX 77008', true],
    ['Music Business 101: Splits, Masters & Publishing', 'A free workshop with a working music attorney covering what emerging artists actually sign. Bring your questions and your contracts.', 'workshop', 'public', true, 23, 'Community Music Center of Houston, 5500 Griggs Rd, Houston, TX 77021', true],
    ['Community Listening Session — East End', 'Address the Music Board directly. Tell us what is and is not working for musicians in your neighborhood. Interpretation available.', 'community', 'public', true, 31, 'Talento Bilingüe de Houston, 333 S Jensen Dr, Houston, TX 77003', true],
    ['Houston Music Census — Launch', 'Kickoff for the citywide count of working musicians, venues, studios, and support businesses.', 'community', 'public', false, 45, 'Cactus Music, 2110 Portsmouth St, Houston, TX 77098', false],
    ['MOCA Grant Application Deadline', 'Final deadline for FY27 individual artist and organization applications through Houston Arts Alliance.', 'deadline', 'public', true, 52, null, false],
    ['Arts + Culture Committee — City Council', 'Board representatives attend and give public testimony on the load zone recommendation. Two members needed at the podium.', 'civic', 'board', false, 7, 'City Hall, 901 Bagby St, Houston, TX 77002', true],
    ['Quarterly retreat with the Music Officer', 'Closed working session with MOCA on FY27 priorities. Full board attendance requested.', 'other', 'board', false, 19, "Mayor's Office of Cultural Affairs, 901 Bagby St", true],
    ['SXSW Houston delegation planning', 'Internal planning for the Houston delegation. Who is attending, what we are presenting, and how it is funded.', 'conference', 'board', false, 38, 'Video call', true],
    ['Board fundraiser — patron dinner', 'Internal planning and host committee assignments for the annual patron dinner.', 'fundraiser', 'board', false, 27, 'Mo Better Brews, 2409 Grant St', true],
  ]

  for (const [title, description, category, visibility, published, days, location, rsvpRequired] of eventSeed) {
    const [row] = await db.insert(events).values({
      title, description, category, visibility, published,
      startsAt: at(days, 19), endsAt: at(days, 22),
      location, rsvpRequired,
      createdByUserId: firstUser?.id,
      externalRsvpUrl: visibility === 'public' && published ? 'https://www.eventbrite.com/' : null,
      boardRepNote: visibility === 'board' ? 'Chair and one additional member to represent the board.' : null,
    }).returning()

    // Partial RSVPs, so "awaiting reply" is a live number in the console.
    if (rsvpRequired && visibility === 'board') {
      const responders = seated.slice(0, Math.max(2, seated.length - 3))
      for (const [i, s] of responders.entries()) {
        await db.insert(eventRsvps).values({
          eventId: row.id, userId: s.userId,
          response: (i % 4 === 3 ? 'no' : i % 3 === 2 ? 'maybe' : 'yes') as any,
        }).onConflictDoNothing()
      }
    }
  }

  /* ---------------- Merch ---------------- */
  await db.insert(merchItems).values([
    { name: 'HMAB Classic Logo Tee', description: 'Heavyweight cotton tee with the board wordmark screen-printed in electric blue. Unisex fit.', category: 'apparel', priceCents: dollarsToCents('28.00'), sizes: 'S,M,L,XL,2XL', stockQty: 42, published: true, sortOrder: 1, availableInPerson: true, externalUrl: 'https://square.link/', createdByUserId: firstUser?.id },
    { name: '"Houston Is A Music City" Hoodie', description: 'Midweight fleece hoodie, embroidered chest hit. Runs true to size.', category: 'apparel', priceCents: dollarsToCents('55.00'), sizes: 'S,M,L,XL,2XL', stockQty: 18, published: true, sortOrder: 2, availableInPerson: true, externalUrl: 'https://square.link/', createdByUserId: firstUser?.id },
    { name: 'Houston Music Map — Screen Print', description: '18×24 three-color screen print of the Houston music map: venues, studios, and landmarks. Signed, numbered edition of 200.', category: 'print', priceCents: dollarsToCents('40.00'), stockQty: 63, published: true, sortOrder: 3, availableInPerson: true, createdByUserId: firstUser?.id },
    { name: 'Screwed Up Click Tribute Enamel Pin', description: 'Hard enamel pin honoring Houston hip hop history. 1.25 inch, double posted.', category: 'accessory', priceCents: dollarsToCents('12.00'), stockQty: 0, published: true, sortOrder: 4, availableInPerson: true, createdByUserId: firstUser?.id },
    { name: 'Houston Music History Zine, Vol. 1', description: '48-page zine tracing Houston music from Miller Outdoor Theater in 1923 to the present. Written by local historians and artists.', category: 'print', priceCents: dollarsToCents('15.00'), stockQty: 87, published: true, sortOrder: 5, availableInPerson: true, createdByUserId: firstUser?.id },
    { name: 'Supporter Bundle', description: 'Tee, zine, map print, and pin. Save $20 versus buying separately, and directly fund artist stipends.', category: 'bundle', priceCents: dollarsToCents('75.00'), sizes: 'S,M,L,XL,2XL', stockQty: 25, published: true, sortOrder: 6, availableInPerson: true, externalUrl: 'https://square.link/', createdByUserId: firstUser?.id },
    { name: 'Tote — Bayou City Sound', description: 'Heavy canvas tote, natural with two-color print. Big enough for records.', category: 'accessory', priceCents: dollarsToCents('22.00'), stockQty: 34, published: false, sortOrder: 7, availableInPerson: true, createdByUserId: firstUser?.id },
  ])

  /* ---------------- Volunteers ---------------- */
  const volSeed: any[] = [
    ['Showcase Night Crew — Fall Emerging Artist Showcase', 'Help the night run: door and check-in, merch table, artist hospitality, and load-out. Two shifts available. No experience needed, just reliability and good energy.', 'The Heights Theater, 339 W 19th St', 16, 12, 'Comfortable on your feet, friendly with a crowd'],
    ['Listening Session Interpreters (Spanish/English)', 'Provide live interpretation so Spanish-speaking community members can address the board directly. This is one of the highest-impact roles we have.', 'Talento Bilingüe de Houston, 333 S Jensen Dr', 31, 4, 'Fluent Spanish and English; interpretation experience helpful'],
    ['Music Census Field Surveyors', 'Help count Houston music. Visit venues, studios, and rehearsal spaces across assigned zip codes and collect survey responses. Training and a stipend provided.', 'Citywide', 45, 20, 'Reliable transportation; comfortable approaching businesses'],
    ['Workshop Setup & Registration', 'Set up the room, run the registration table, and help participants get settled for the Music Business 101 workshop.', 'Community Music Center of Houston, 5500 Griggs Rd', 23, 6, null],
    ['Archive & Oral History Project', 'Help digitize photos, flyers, and recordings from Houston music history, and assist with recording oral history interviews with longtime artists.', 'Remote and in-person', 60, null, 'Detail-oriented; audio editing a plus'],
  ]

  const volunteerNames = [
    ['Marisol Reyes', 'marisol.reyes@example.com', 'Bgirl City'],
    ['DeAndre Whitfield', 'deandre.w@example.com', null],
    ['Priya Raman', 'praman@example.com', 'Rice University'],
    ['Tomás Delgado', 'tomas.delgado@example.com', 'Talento Bilingüe'],
    ['Keisha Brooks', 'keisha.brooks@example.com', 'SongFest'],
    ['Jordan Nguyen', 'jnguyen@example.com', null],
    ['Alicia Contreras', 'alicia.c@example.com', 'Girls Rock Camp Houston'],
    ['Marcus Bell', 'marcus.bell@example.com', 'SwishaHouse'],
    ['Hannah Okafor', 'hokafor@example.com', null],
    ['Luis Mendoza', 'luis.mendoza@example.com', 'Mo Better Brews'],
    ['Rachel Kim', 'rachel.kim@example.com', 'Houston Live'],
    ['Devon Carter', 'devon.carter@example.com', null],
  ]

  let nameIdx = 0
  for (const [title, description, location, days, slots, skills] of volSeed) {
    const [opp] = await db.insert(volunteerOpportunities).values({
      title, description, location,
      startsAt: at(days, 17), endsAt: at(days, 23),
      slots, skillsWanted: skills,
      contactEmail: 'volunteer@houstonmusicadvisoryboard.com',
      published: true,
      closesAt: at(days - 2, 23, 59),
    }).returning()

    // Fill some but not all slots, and push one opportunity into waitlist.
    const count = slots ? Math.min(slots + (title.startsWith('Listening') ? 2 : -2), volunteerNames.length) : 3
    for (let i = 0; i < Math.max(0, count); i++) {
      const [name, email, org] = volunteerNames[nameIdx++ % volunteerNames.length]
      const taken = i
      const status = slots && taken >= slots ? 'waitlisted' : i % 3 === 0 ? 'confirmed' : 'pending'
      await db.insert(volunteerSignups).values({
        opportunityId: opp.id, name, email: `${opp.id}.${email}`, organization: org,
        status: status as any,
        createdAt: new Date(now - (10 - (i % 9)) * day),
      }).onConflictDoNothing()
    }
  }


  /* ---------------- Venues (booking directory) ---------------- *
   * Venue names, addresses, and capacities are real and public. Booking
   * CONTACTS are placeholders on example.com and left unverified: publishing a
   * fabricated booking address under a real venue's name would send artists to
   * a dead end and misrepresent the venue. Replace with confirmed contacts
   * before publishing for real.
   */
  const venueSeed: any[] = [
    ['White Oak Music Hall', '2915 N Main St, Houston, TX 77009', 'Near Northside', 'club', 1400, 'indie, rock, hip hop, Latin', true, 'guarantee_plus_split', true, true, true, 'Two indoor rooms plus a lawn; full backline available on request.'],
    ['The Heights Theater', '339 W 19th St, Houston, TX 77008', 'Heights', 'theater', 600, 'americana, singer-songwriter, soul, indie', true, 'guarantee', false, true, true, 'Seated historic theater, excellent room sound.'],
    ['Cactus Music', '2110 Portsmouth St, Houston, TX 77098', 'Upper Kirby', 'record_store', 150, 'all genres, in-store performances', true, 'tips_only', true, false, false, 'Free in-store sets, usually tied to a release.'],
    ['Mo Better Brews', '2409 Grant St, Houston, TX 77006', 'Montrose', 'restaurant', 120, 'jazz, soul, hip hop, spoken word', true, 'door_split', true, false, true, 'Community-focused room with a regular open mic.'],
    ['Continental Club Houston', '3700 Main St, Houston, TX 77002', 'Midtown', 'club', 300, 'blues, rockabilly, country, soul', true, 'guarantee', false, true, true, 'Classic Main Street stage with house sound.'],
    ['Rudyard\'s British Pub', '2010 Waugh Dr, Houston, TX 77006', 'Montrose', 'bar', 150, 'punk, indie, garage, metal', true, 'door_split', false, false, true, 'Upstairs room, long-running local booking.'],
    ['Miller Outdoor Theatre', '6000 Hermann Park Dr, Houston, TX 77030', 'Hermann Park', 'outdoor', 4500, 'all genres, family programming', true, 'guarantee', true, true, true, 'Free public programming; applications run on an annual cycle.'],
    ['Discovery Green', '1500 McKinney St, Houston, TX 77010', 'Downtown', 'outdoor', 5000, 'all genres, festivals', true, 'guarantee', true, true, true, 'Downtown park stage; programmed seasonally.'],
    ['Last Concert Cafe', '1403 Nance St, Houston, TX 77002', 'Downtown', 'bar', 250, 'reggae, jam, funk, Latin', true, 'door_split', true, false, true, 'Indoor stage plus a courtyard.'],
    ['Warehouse Live Midtown', '2600 Travis St, Houston, TX 77006', 'Midtown', 'club', 800, 'hip hop, rock, electronic, Latin', true, 'guarantee_plus_split', true, true, true, 'Multiple rooms at different capacities.'],
    ['Axelrad Beer Garden', '1517 Alabama St, Houston, TX 77004', 'Midtown', 'outdoor', 400, 'indie, Latin, DJ sets, jazz', true, 'guarantee', true, false, true, 'Outdoor hammock garden; early evening sets.'],
    ['The Secret Group', '2101 Polk St, Houston, TX 77003', 'EaDo', 'club', 300, 'comedy, indie, punk, hip hop', true, 'door_split', false, false, true, 'Multiple rooms; comedy and music both booked.'],
  ]

  for (const [name, address, neighborhood, venueType, capacity, genresBooked, acceptsSubmissions, paysArtists, allAges, hasBackline, hasSoundEngineer, stageNotes] of venueSeed) {
    await db.insert(bookingVenues).values({
      name, address, neighborhood, venueType, capacity, genresBooked,
      acceptsSubmissions, paysArtists, allAges, hasBackline, hasSoundEngineer, stageNotes,
      bookingEmail: `booking@${String(name).toLowerCase().replace(/[^a-z0-9]+/g, '')}.example.com`,
      submissionNotes: acceptsSubmissions
        ? 'Send links, not attachments. Include draw, past Houston dates, and available dates.'
        : 'Booked through promoters and agents; unsolicited submissions are not reviewed.',
      published: true,
      verifiedAt: null,
      createdByUserId: undefined,
    } as any)
  }

  /* ---------------- Musicians ---------------- */
  const musicianSeed: any[] = [
    ['Selena Vasquez', 'La Chica Selva', 'solo', 'cumbia, psych, Latin alternative', 'East End', 'Cumbia-rooted songwriter blending psych guitar with Colombian and Tejano rhythms. Six years playing Houston rooms from Axelrad to White Oak.', 6, 1, 'gigs,collaborators'],
    ['Marcus Bell', 'MB the Third', 'producer', 'hip hop, soul, r&b', 'Third Ward', 'Producer and engineer working out of a home studio in Third Ward. Credits across Houston independent hip hop; open to session and mixing work.', 11, 1, 'session_work,studio_time'],
    ['The Bayou Kings', null, 'band', 'blues, zydeco, swamp rock', 'Fifth Ward', 'Five-piece blues and zydeco outfit carrying the Gulf Coast tradition. Regular festival and club dates across Southeast Texas.', 14, 5, 'gigs,representation'],
    ['Priya Raman', null, 'composer', 'contemporary classical, film score', 'Museum District', 'Composer writing for chamber ensembles and independent film. Rice-trained; interested in cross-genre collaboration with Houston songwriters.', 9, 1, 'collaborators,gigs'],
    ['Jordan Nguyen', 'DJ Sanguine', 'dj', 'house, disco, afrobeat', 'Montrose', 'DJ and selector focused on dance floors that actually move. Residencies across Montrose and EaDo.', 7, 1, 'gigs'],
    ['Ericka de Leon', 'Bgirl Reina', 'solo', 'hip hop, breaks, spoken word', 'Northside', 'B-girl, MC, and organizer. Founder of a long-running vintage flea market and hip hop showcase series.', 15, 1, 'gigs,collaborators,mentorship'],
    ['Tomás Delgado', null, 'duo', 'norteño, conjunto', 'Magnolia Park', 'Accordion and bajo sexto duo playing traditional conjunto for dances, weddings, and festivals across the East End.', 22, 2, 'gigs'],
    ['Hannah Okafor', 'HAZE', 'solo', 'neo-soul, r&b, jazz', 'Alief', 'Vocalist and songwriter working in neo-soul and jazz. Building toward a first full-length; seeking a band and studio time.', 4, 1, 'bandmates,studio_time,collaborators'],
    ['Devon Carter', null, 'band', 'punk, hardcore', 'EaDo', 'Four-piece hardcore band playing DIY spaces and Rudyard\'s. Loud, fast, and very reliable about load-in.', 5, 4, 'gigs'],
    ['Rachel Kim', null, 'ensemble', 'chamber, crossover, experimental', 'Heights', 'String ensemble that programs contemporary work alongside arrangements of Houston artists. Available for concerts and recording sessions.', 8, 6, 'gigs,session_work,collaborators'],
    ['Keisha Brooks', 'Sister Keish', 'solo', 'gospel, soul', 'Sunnyside', 'Gospel vocalist and choir director. Twenty years leading Houston congregations; also available for session and live backing work.', 20, 1, 'session_work,gigs,mentorship'],
    ['Luis Mendoza', 'Mendo', 'producer', 'reggaeton, Latin trap, electronic', 'Gulfton', 'Producer building Latin trap and reggaeton for Houston artists. Runs a small project studio and mentors younger producers.', 6, 1, 'collaborators,session_work'],
  ]

  for (const [name, stageName, actType, genres, neighborhood, bio, yearsActive, memberCount, lookingFor] of musicianSeed) {
    const slug = String(stageName || name).toLowerCase().replace(/[^a-z0-9]+/g, '.')
    await db.insert(musicians).values({
      name, stageName, actType, genres, neighborhood, bio, yearsActive, memberCount, lookingFor,
      email: `${slug}@example.com`,
      status: 'approved',
      listed: true,
      availableForBooking: true,
      streamingUrl: 'https://open.spotify.com/',
      socialUrl: 'https://www.instagram.com/',
      createdAt: new Date(now - Math.floor(Math.random() * 0 + 40) * day),
    } as any).onConflictDoNothing()
  }

  // Two pending submissions so the moderation queue is not empty in the demo.
  for (const [name, stageName, genres] of [['Andre Sims', 'Dre Sims', 'jazz, funk'], ['Camila Ortiz', null, 'indie pop, bedroom pop']]) {
    await db.insert(musicians).values({
      name, stageName, actType: 'solo', genres, neighborhood: 'Houston',
      bio: 'Recently submitted through the public sign-up form and awaiting board review.',
      email: `${String(name).toLowerCase().replace(/[^a-z0-9]+/g, '.')}@example.com`,
      status: 'pending', listed: true, lookingFor: 'gigs',
    } as any).onConflictDoNothing()
  }

  const counts = async (t: any) => Number((await db.select({ c: sql<number>`count(*)` }).from(t))[0].c)

  return {
    ok: true,
    seeded: {
      meetings: await counts(meetings),
      agendaItems: await counts(agendaItems),
      motions: await counts(motions),
      votes: await counts(votes),
      issues: await counts(issues),
      transactions: await counts(transactions),
      events: await counts(events),
      merch: await counts(merchItems),
      volunteerOpportunities: await counts(volunteerOpportunities),
      volunteerSignups: await counts(volunteerSignups),
      musicians: await counts(musicians),
      venues: await counts(bookingVenues),
    },
  }
})
