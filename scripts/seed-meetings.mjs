// Generates migrations/0005_meetings_history.sql — the board's REAL meeting
// history, transcribed from .seedmaterial agendas/minutes + board email records.
// Run: node scripts/seed-meetings.mjs
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const q = (s) => `'${String(s).replace(/'/g, "''")}'`
// Central time: CST = UTC-6 (winter), CDT = UTC-5 (summer)
const cst = (y, m, d, h, min = 0) => Date.UTC(y, m - 1, d, h + 6, min)
const cdt = (y, m, d, h, min = 0) => Date.UTC(y, m - 1, d, h + 5, min)

const lines = ['-- Migration number: 0005    Real meeting history (from board agendas/minutes — no fabricated data)']

let itemPos = 0
function meeting(id, m) {
  lines.push(
    `INSERT INTO meetings (id, title, type, status, starts_at, ends_at, location, quorum_required, seats_at_notice, called_to_order_at, adjourned_at, minutes_body, minutes_status, created_at) VALUES (` +
    [id, q(m.title), q(m.type || 'regular'), q('adjourned'), m.start, m.end ?? 'NULL', q(m.location), m.quorum ?? 4, m.seats ?? 7,
      m.calledToOrder ?? 'NULL', m.end ?? 'NULL', m.minutes ? q(m.minutes) : 'NULL', q(m.minutesStatus || 'none'), m.start].join(', ') + ');')
  itemPos = 0
  for (const [kind, title, description] of m.agenda || []) {
    itemPos += 10
    lines.push(
      `INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (` +
      [id, itemPos, q(kind), q(title), description ? q(description) : 'NULL', q('completed'), m.start].join(', ') + ');')
  }
  for (const [memberId, status, note] of m.attendance || []) {
    lines.push(
      `INSERT INTO attendance (meeting_id, member_id, status, note) VALUES (` +
      [id, memberId, q(status), note ? q(note) : 'NULL'].join(', ') + ');')
  }
}

meeting(1, {
  title: '2023 Board Meeting — Listening Session Review + 2023 Planning',
  start: cst(2023, 1, 17, 18), end: cst(2023, 1, 17, 20),
  location: 'Houston City Hall, 901 Bagby St',
  quorum: 4, seats: 7,
  agenda: [
    ['call_to_order', 'Welcome — Gracie Chavez, Music & Tourism Officer (MOCA); remarks from Chair Jason Woods'],
    ['report', 'Presentation: Listening Session Overview', 'Overall takeaways, review categories, top concerns, next steps (Gracie, 10 min)'],
    ['discussion', '2023 Challenges + Opportunities', 'Top challenges/opportunities for 2023; action plan and timeframe; subcommittees; number of community events and listening sessions; funding — sponsorships/partnerships and working with a nonprofit to administer funds'],
    ['action', 'Action Items', 'Majority vote on top 3-5 challenges/opportunities; determine next steps; schedule tentative events (sessions, workshops, panels, lectures); determine funding options; advise/report 2023 action plan to MOCA'],
    ['announcements', 'Additional Business + Upcoming Events', 'Houston Music History Timeline; El Dorado Ballroom Restoration — Preservation of Houston Landmarks panel; houston-music.live; Music Directory; Make Music Day June 21'],
    ['public_comment', 'Q&A'],
    ['adjournment', 'Adjourn'],
  ],
})

meeting(2, {
  title: '2024 Board Meeting — New Members Seated, Officer Elections',
  start: cst(2024, 1, 24, 18), end: cst(2024, 1, 24, 20),
  location: 'Houston City Hall, First Floor',
  minutesStatus: 'submitted',
  minutes: `Attendance: Jason Woods, Lupe Olivares, Gracie Chavez, Dria Thornton, Mike (Frost) Moore, Marissa Saenz; Tracy DeJarnett (virtual). Absent: Anna Garza, Jagi Kaital, Jason Kane, Mark Austin.

New members welcomed: Dria Thornton, Mike Moore, Marissa Saenz (onboarded December 2023).

Officer elections: Tracy DeJarnett elected Board Secretary; Dria Thornton elected Treasurer.

2024 priorities set: fundraising, collaboration, music business development, music tourism, busking/street-performance permitting (post-Astroworld environment).

2023 recap: 422 listening-session respondents across the 2023 cycle; preservation focus documented El Dorado Ballroom and SugarHill Records.

Planned activations: pre-SXSW Houston event (March 7-9) and post-SXSW Music City Forum (March 17).`,
  agenda: [
    ['call_to_order', 'Welcome + new member introductions'],
    ['action', 'Officer elections', 'Board Secretary and Treasurer'],
    ['discussion', '2024 priorities', 'Fundraising, collaboration, music business development, music tourism, busking/permitting'],
    ['report', '2023 listening session recap', '422 respondents; El Dorado Ballroom + SugarHill Records preservation focus'],
    ['announcements', 'SXSW activations', 'Pre-SXSW event Mar 7-9; post-SXSW Music City Forum Mar 17'],
    ['adjournment', 'Adjourn'],
  ],
})

meeting(3, {
  title: '2025 Board Meeting — Officer Elections + 2025 Focus',
  start: cst(2025, 1, 14, 18), end: cst(2025, 1, 14, 20),
  location: 'Rukaz Kultura, 5503 Lawndale St',
  minutesStatus: 'submitted',
  minutes: `Officer elections (per 2025 election rules — chair/vice-chair/treasurer every two years, secretary annually): Chair Jason Woods, Vice-Chair Marissa Saenz, Secretary Gracie Chavez, Treasurer Dria Thornton (through 2026).

Members + officers remaining for a second term through January 2027: Jason Woods, Ericka De Leon, Jagi Kaital, Marissa Saenz, Lupe Olivares. Terms expired January 2025: Mark Austin (Position 3), Tracy DeJarnett (Position 5).

2024 Listening Session review — top concerns: Music Business Development, Healthcare/Wellness, Funding/Grants, Collaboration, Audience Development.

2025 focus (majority vote, top 3): Music Business Development, Healthcare/Wellness, Funding/Grants. Programs to schedule April, June, August, plus an October listening session.

Gracie Chavez announced her departure from the City (Music Officer role) effective January 24, 2025; she continues as Board Founder.`,
  agenda: [
    ['call_to_order', 'Welcome + Updates — Music Officer Gracie Chavez + Chair Jason Woods', 'Guidelines + contact updates'],
    ['report', 'Board + New Officials', 'Boards & Commissions terms; board terms; MOCA and officer terms'],
    ['action', 'Action Item #1: Officer elections', 'Chair, Vice-Chair, Secretary (annual)'],
    ['report', '2024 Listening Session Presentation', 'Takeaways and top concerns: Music Business Dev, Healthcare/Wellness, Funding/Grants, Collaboration, Audience Development'],
    ['discussion', '2025 Music Focus', 'Action plan, programming, community activations'],
    ['action', 'Action Item #2: Vote top 3 topics', 'Schedule programs April, June, Aug + October listening session'],
    ['announcements', 'Additional Business', 'TMO East Texas Region monthly chapter meetings; Houston Music Classifieds / band registry; houston-music.live; Music Directory value proposition'],
    ['public_comment', 'Q&A'],
    ['adjournment', 'Adjourn'],
  ],
})

meeting(4, {
  title: 'January 2026 Board Meeting — Recruits, Financials, 2026 Focus',
  start: cst(2026, 1, 20, 18, 30), end: cst(2026, 1, 20, 20, 30),
  calledToOrder: cst(2026, 1, 20, 18, 46),
  location: 'Rukaz Kultura, 5503 Lawndale St + Zoom',
  minutesStatus: 'submitted',
  minutes: `MINUTES — Houston Music Advisory Board, January 20, 2026 (revised 01/23/26).

In attendance: Gracie Chavez, Jason Woods, Marissa Saenz, Lupe Olivares, Ericka De Leon. Virtual: Dria Thornton, Mike Moore. Not present: Jagi Kaital, Henry Guidry. Meeting called to order 6:46 pm; recorded in MeetGeek.

Updates: 2026 Guidelines updated (review highlighted sections; guidelines to be posted online).

Financial report (Treasurer Dria Thornton): balance $14,590.12. Outstanding: $1,000 — Artist Survey org partnership (Fresh Arts).

New board recruits: January elections (Secretary, Treasurer) delayed until new members onboard, Spring 2026. Four finalists identified for two vacancies: Alex Navarro, Alex La Rotta, Russel Reinhart, Grace Rodriguez. Interviews to be scheduled in February (Vice-Chair); prior to interviews, internal meeting of board officials on selection process and recommendations to the City / Mayor's Office of Intergovernmental Relations.

2026 community focus — members elected to revisit the previous year's top three concerns: Music Business Development, Healthcare/Wellness, Funding/Grants. Lupe: 2026 Wellness Music Fest in partnership with El Centro de Corazón.

Committees (terms to be defined by the Chairman): Healthcare — Gracie Chavez (Committee Chair) + Kam Franklin (ambassador). Fundraising — Dria Thornton (Committee Chair). Subcommittee members may be appointed by the Chairman or volunteer by area of expertise; community ambassador/ally terms and responsibilities to be defined.`,
  agenda: [
    ['call_to_order', 'Welcome + Updates — Gracie Chavez + Chair Jason Woods', 'Guidelines + contact updates'],
    ['treasurer_report', 'Financial Report — Treasurer Dria Thornton', 'Balance $14,590.12; $1,000 outstanding (Fresh Arts artist survey partnership)'],
    ['discussion', 'Selecting New Board Recruits', 'Terms (Jan 2027: Jason + Marissa; Jan 2026: Gracie + Dria); delay board elections; identify finalists for interviews; recommendation to City administrators'],
    ['action', 'Action Item #1: Vote 2026 Music Priority Focus (top 3)', 'Music Business Dev, Healthcare/Wellness, Funding/Grants, Collaboration, Audience Development'],
    ['discussion', 'Committees + Partnerships', 'Healthcare: Kam Franklin + Gracie Chavez; MESA (HCC) internships Spring 2026; Houston Music Classifieds / band registry; Music + Texas Music directories; social media management (IG @hmabtx, Boma proposal); houston-music.live domain switch; Indie Sync Bundles June/July; Fall 2026 listening session'],
    ['discussion', 'Texas Music Office + City of Houston', 'Official city representation and nonprofit status'],
    ['announcements', 'Additional Business', 'TMO East Texas Region monthly meetings; Sound Diplomacy Conference Feb 2-3, Los Angeles'],
    ['public_comment', 'Q&A'],
    ['adjournment', 'Adjourn'],
  ],
  // member ids: 1 Jason(chair) 2 Marissa 3 Gracie 4 Dria 5 Ericka 6 Henry 7 Jagi 8 Frost(alt) 9 Lupe(alt)
  attendance: [
    [3, 'present'], [1, 'present'], [2, 'present'], [9, 'present'], [5, 'present'],
    [4, 'remote'], [8, 'remote'],
    [7, 'absent'], [6, 'absent'],
  ],
})

meeting(5, {
  title: 'August 2026 Board Meeting — Recruits, Fundraising, Website',
  start: cdt(2026, 8, 25, 18, 30), end: cdt(2026, 8, 25, 20, 30),
  location: 'Rukaz Kultura, 5503 Lawndale St',
  minutesStatus: 'none',
  agenda: [
    ['call_to_order', 'Welcome + Updates — Chair Jason Woods', 'Guidelines + contact updates'],
    ['treasurer_report', 'Financial Report — Treasurer Dria Thornton'],
    ['report', 'New Board Recruits Update — Vice-Chair Marissa Saenz', 'Boards & Commissions updates; recommendation to City administrators; finalists for consideration'],
    ['report', '2026 Focus for Music Community — Gracie + Babygirl', 'Music Business Dev, Healthcare/Wellness, Funding/Grants'],
    ['report', 'Social Media Management (IG @hmabtx) — Boma Curates', 'Key metrics; shared resources and opportunities; partnerships; effectiveness'],
    ['discussion', 'Fundraising — Gracie + Dria', 'Budget review, expenses, income projections, cashflow forecast; committees; community allies and ambassadors'],
    ['report', 'Website — Mike Frost', 'houston-music.live domain switch; consistently provide resources + opportunities for the music community'],
    ['discussion', 'Action Plan Q3/Q4 2026', 'Programming; community activations; plan Fall 2026 listening session'],
    ['discussion', 'Texas Music Office + COH', 'Official city representation and nonprofit status; COH Office of the Arts Director Michele Leal'],
    ['announcements', 'Additional Business', 'TMO East Texas Region monthly meetings; TMO Texas Sounds & Cities Conference Nov 5-6, Dallas'],
    ['public_comment', 'Q&A'],
    ['adjournment', 'Adjourn'],
  ],
})

writeFileSync(join(root, 'migrations/0005_meetings_history.sql'), lines.join('\n') + '\n')
console.log('statements:', lines.length - 1)
