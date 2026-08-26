import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

const now = () => integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date())

/* ------------------------------------------------------------------ *
 * People
 * ------------------------------------------------------------------ */

/** Anyone who can sign in. Board members, staff, and volunteer coordinators. */
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  // admin  - full control, manages members and settings
  // officer- chair/vice/secretary/treasurer powers (run meetings, publish agendas)
  // member - seated board member: can move, second, and vote
  // staff  - support: drafts agendas and minutes, no vote
  role: text('role', { enum: ['admin', 'officer', 'member', 'staff'] }).notNull().default('member'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt: now(),
}, t => [uniqueIndex('users_email_idx').on(t.email)])

/**
 * A seat on the board. Separate from `users` because seats have terms:
 * a person may hold a seat, term out, and later be reappointed. Quorum is
 * computed from currently-seated members, so this table is the source of truth.
 */
export const members = sqliteTable('members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  /**
   * 'alternate' is structurally different from the rest: alternates hold a seat
   * but are NOT counted in the quorum denominator, and may only vote when the
   * chair seats them for a specific meeting in place of an absent member.
   */
  position: text('position', {
    enum: ['chair', 'vice_chair', 'secretary', 'treasurer', 'member', 'alternate'],
  }).notNull().default('member'),
  organization: text('organization'),
  title: text('title'),
  bio: text('bio'),
  seatNumber: integer('seat_number'),
  termStart: integer('term_start', { mode: 'timestamp_ms' }),
  termEnd: integer('term_end', { mode: 'timestamp_ms' }),
  /** false once the term ends or the member resigns; excluded from quorum math */
  seated: integer('seated', { mode: 'boolean' }).notNull().default(true),
  createdAt: now(),
}, t => [index('members_user_idx').on(t.userId), index('members_seated_idx').on(t.seated)])

/* ------------------------------------------------------------------ *
 * Issues - the pipeline that feeds agendas
 * ------------------------------------------------------------------ */

/**
 * Something the board might act on. Issues are raised (by members or the
 * public), prioritized by member support, then scheduled onto an agenda where
 * they become the subject of a formal motion.
 */
export const issues = sqliteTable('issues', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category', {
    enum: ['venues', 'funding', 'policy', 'education', 'events', 'advocacy', 'internal', 'other'],
  }).notNull().default('other'),
  status: text('status', {
    enum: ['submitted', 'under_review', 'scheduled', 'resolved', 'rejected', 'deferred'],
  }).notNull().default('submitted'),
  priority: text('priority', { enum: ['low', 'normal', 'high', 'urgent'] }).notNull().default('normal'),
  /** null when submitted through the public form */
  submittedByUserId: integer('submitted_by_user_id').references(() => users.id, { onDelete: 'set null' }),
  submitterName: text('submitter_name'),
  submitterEmail: text('submitter_email'),
  isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(false),
  resolutionNote: text('resolution_note'),
  createdAt: now(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
}, t => [index('issues_status_idx').on(t.status), index('issues_category_idx').on(t.category)])

/**
 * Straw-poll support used to rank the backlog. Deliberately NOT a binding vote:
 * binding action happens only via a motion in a meeting with quorum.
 */
export const issueSupport = sqliteTable('issue_support', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  issueId: integer('issue_id').notNull().references(() => issues.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  weight: integer('weight').notNull().default(1),
  createdAt: now(),
}, t => [uniqueIndex('issue_support_unique').on(t.issueId, t.userId)])

/* ------------------------------------------------------------------ *
 * Meetings
 * ------------------------------------------------------------------ */

export const meetings = sqliteTable('meetings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  type: text('type', {
    enum: ['regular', 'special', 'committee', 'workshop', 'listening_session', 'emergency'],
  }).notNull().default('regular'),
  status: text('status', {
    enum: ['draft', 'noticed', 'in_progress', 'adjourned', 'cancelled'],
  }).notNull().default('draft'),
  startsAt: integer('starts_at', { mode: 'timestamp_ms' }).notNull(),
  endsAt: integer('ends_at', { mode: 'timestamp_ms' }),
  location: text('location').notNull(),
  virtualUrl: text('virtual_url'),
  /**
   * When the agenda was posted publicly. Standard government practice is at
   * least 72 hours before the meeting; `noticeHoursBefore` records the actual
   * lead time so the gap is visible rather than silently ignored.
   */
  noticePostedAt: integer('notice_posted_at', { mode: 'timestamp_ms' }),
  noticeRequiredHours: integer('notice_required_hours').notNull().default(72),
  /** Quorum snapshot, frozen when the meeting is called to order. */
  seatsAtNotice: integer('seats_at_notice'),
  quorumRequired: integer('quorum_required'),
  calledToOrderAt: integer('called_to_order_at', { mode: 'timestamp_ms' }),
  adjournedAt: integer('adjourned_at', { mode: 'timestamp_ms' }),
  minutesBody: text('minutes_body'),
  minutesStatus: text('minutes_status', {
    enum: ['none', 'draft', 'submitted', 'approved'],
  }).notNull().default('none'),
  /** The motion at a LATER meeting that adopted these minutes. */
  minutesApprovedByMotionId: integer('minutes_approved_by_motion_id'),
  createdAt: now(),
}, t => [index('meetings_starts_idx').on(t.startsAt), index('meetings_status_idx').on(t.status)])

/**
 * Standard government agenda order. `kind` drives the default template so every
 * meeting opens with call to order / roll call and closes with adjournment.
 */
export const agendaItems = sqliteTable('agenda_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  meetingId: integer('meeting_id').notNull().references(() => meetings.id, { onDelete: 'cascade' }),
  /** Sort key. Gaps allowed so items can be reordered without renumbering. */
  position: integer('position').notNull(),
  /** Display label, e.g. "4.a" - computed on save, stored for the printed agenda. */
  itemNumber: text('item_number'),
  kind: text('kind', {
    enum: [
      'call_to_order', 'roll_call', 'approval_of_agenda', 'approval_of_minutes',
      'public_comment', 'consent', 'report', 'treasurer_report', 'old_business', 'new_business',
      'discussion', 'action', 'announcements', 'executive_session', 'adjournment',
    ],
  }).notNull().default('new_business'),
  title: text('title').notNull(),
  description: text('description'),
  /** Set when this item came off the issue backlog. */
  issueId: integer('issue_id').references(() => issues.id, { onDelete: 'set null' }),
  presenterUserId: integer('presenter_user_id').references(() => users.id, { onDelete: 'set null' }),
  minutesAllotted: integer('minutes_allotted'),
  /** Whether this item is expected to produce a vote. */
  actionRequired: integer('action_required', { mode: 'boolean' }).notNull().default(false),
  status: text('status', {
    enum: ['pending', 'in_progress', 'completed', 'tabled', 'withdrawn'],
  }).notNull().default('pending'),
  notes: text('notes'),
  createdAt: now(),
}, t => [index('agenda_meeting_idx').on(t.meetingId, t.position)])

export const attendance = sqliteTable('attendance', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  meetingId: integer('meeting_id').notNull().references(() => meetings.id, { onDelete: 'cascade' }),
  memberId: integer('member_id').notNull().references(() => members.id, { onDelete: 'cascade' }),
  status: text('status', {
    enum: ['present', 'remote', 'absent', 'excused', 'late'],
  }).notNull().default('absent'),
  arrivedAt: integer('arrived_at', { mode: 'timestamp_ms' }),
  departedAt: integer('departed_at', { mode: 'timestamp_ms' }),
  note: text('note'),
  /**
   * Set on an ALTERNATE's row when the chair seats them for this meeting in
   * place of the named absent regular member. While set, the alternate counts
   * toward quorum and may vote; otherwise they may attend but not act.
   */
  actingForMemberId: integer('acting_for_member_id'),
}, t => [uniqueIndex('attendance_unique').on(t.meetingId, t.memberId)])

/* ------------------------------------------------------------------ *
 * Motions and votes - Robert's Rules
 * ------------------------------------------------------------------ */

/**
 * A motion under Robert's Rules. `kind` determines whether a second is needed,
 * whether it is debatable, and the threshold to carry - see server/utils/motions.ts.
 * Precedence: a subsidiary motion attaches to the main motion via `parentMotionId`
 * and must be disposed of before the board returns to the main question.
 */
export const motions = sqliteTable('motions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  meetingId: integer('meeting_id').notNull().references(() => meetings.id, { onDelete: 'cascade' }),
  agendaItemId: integer('agenda_item_id').references(() => agendaItems.id, { onDelete: 'set null' }),
  /** Set for subsidiary motions (amend, postpone, call the question...). */
  parentMotionId: integer('parent_motion_id'),
  /** For approve_minutes: which meeting's minutes this motion adopts. */
  relatedMeetingId: integer('related_meeting_id'),
  kind: text('kind', {
    enum: [
      'main', 'amend', 'substitute', 'postpone_definitely', 'postpone_indefinitely',
      'refer_to_committee', 'lay_on_table', 'take_from_table', 'previous_question',
      'limit_debate', 'recess', 'adjourn', 'reconsider', 'rescind', 'suspend_rules',
      'approve_minutes', 'approve_agenda', 'approve_consent', 'accept_report', 'approve_expenditure', 'approve_budget',
    ],
  }).notNull().default('main'),
  text: text('text').notNull(),
  movedByMemberId: integer('moved_by_member_id').references(() => members.id, { onDelete: 'set null' }),
  secondedByMemberId: integer('seconded_by_member_id').references(() => members.id, { onDelete: 'set null' }),
  /** majority | two_thirds | unanimous - resolved from `kind` but stored so history survives rule changes. */
  threshold: text('threshold', { enum: ['majority', 'two_thirds', 'unanimous'] }).notNull().default('majority'),
  method: text('method', {
    enum: ['voice', 'roll_call', 'unanimous_consent', 'show_of_hands'],
  }).notNull().default('roll_call'),
  status: text('status', {
    enum: ['proposed', 'seconded', 'debating', 'voting', 'carried', 'failed', 'tabled', 'withdrawn', 'ruled_out_of_order'],
  }).notNull().default('proposed'),
  /** Frozen tallies, written when the chair closes the vote. */
  ayes: integer('ayes'),
  nays: integer('nays'),
  abstentions: integer('abstentions'),
  recusals: integer('recusals'),
  absent: integer('absent'),
  /** Seated members at the moment of the vote - the denominator for the threshold. */
  seatsAtVote: integer('seats_at_vote'),
  openedAt: integer('opened_at', { mode: 'timestamp_ms' }),
  closedAt: integer('closed_at', { mode: 'timestamp_ms' }),
  createdAt: now(),
}, t => [index('motions_meeting_idx').on(t.meetingId), index('motions_agenda_idx').on(t.agendaItemId)])

/**
 * One member's vote on one motion. Roll-call votes are recorded per member and
 * are permanent once the vote closes - amendments happen by a motion to
 * reconsider, never by editing history.
 */
export const votes = sqliteTable('votes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  motionId: integer('motion_id').notNull().references(() => motions.id, { onDelete: 'cascade' }),
  memberId: integer('member_id').notNull().references(() => members.id, { onDelete: 'cascade' }),
  /** recuse = conflict of interest; excluded from the threshold denominator. */
  choice: text('choice', { enum: ['aye', 'nay', 'abstain', 'recuse', 'absent'] }).notNull(),
  /** Required when choice = 'recuse' so the conflict is on the record. */
  reason: text('reason'),
  castAt: integer('cast_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
}, t => [uniqueIndex('votes_unique').on(t.motionId, t.memberId)])

/* ------------------------------------------------------------------ *
 * Volunteers
 * ------------------------------------------------------------------ */

export const volunteerOpportunities = sqliteTable('volunteer_opportunities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  location: text('location'),
  startsAt: integer('starts_at', { mode: 'timestamp_ms' }),
  endsAt: integer('ends_at', { mode: 'timestamp_ms' }),
  /** null = unlimited */
  slots: integer('slots'),
  skillsWanted: text('skills_wanted'),
  contactEmail: text('contact_email'),
  published: integer('published', { mode: 'boolean' }).notNull().default(false),
  closesAt: integer('closes_at', { mode: 'timestamp_ms' }),
  createdAt: now(),
}, t => [index('vol_opps_published_idx').on(t.published, t.startsAt)])

export const volunteerSignups = sqliteTable('volunteer_signups', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  opportunityId: integer('opportunity_id').notNull()
    .references(() => volunteerOpportunities.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  organization: text('organization'),
  message: text('message'),
  status: text('status', {
    enum: ['pending', 'confirmed', 'waitlisted', 'declined', 'attended', 'no_show'],
  }).notNull().default('pending'),
  createdAt: now(),
}, t => [
  uniqueIndex('signup_unique').on(t.opportunityId, t.email),
  index('signup_opp_idx').on(t.opportunityId),
])



/* ------------------------------------------------------------------ *
 * Events
 * ------------------------------------------------------------------ */

/**
 * Anything on the board's calendar that is not a formal meeting: showcases,
 * community events, conferences, deadlines.
 *
 * `visibility` is the important field. 'public' events appear on the website;
 * 'board' events are internal and never leave the console - used for things
 * the board attends together and must confirm headcount for.
 */
export const events = sqliteTable('events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category', {
    enum: ['showcase', 'workshop', 'community', 'conference', 'fundraiser', 'deadline', 'civic', 'other'],
  }).notNull().default('other'),
  visibility: text('visibility', { enum: ['public', 'board'] }).notNull().default('board'),
  /** Public events still need an explicit publish step before they go live. */
  published: integer('published', { mode: 'boolean' }).notNull().default(false),
  startsAt: integer('starts_at', { mode: 'timestamp_ms' }).notNull(),
  endsAt: integer('ends_at', { mode: 'timestamp_ms' }),
  allDay: integer('all_day', { mode: 'boolean' }).notNull().default(false),
  location: text('location'),
  virtualUrl: text('virtual_url'),
  imageUrl: text('image_url'),
  /** Public RSVP handled elsewhere (Eventbrite etc.) - just link out. */
  externalRsvpUrl: text('external_rsvp_url'),
  /** Ask seated members to confirm whether they are attending. */
  rsvpRequired: integer('rsvp_required', { mode: 'boolean' }).notNull().default(false),
  rsvpDeadline: integer('rsvp_deadline', { mode: 'timestamp_ms' }),
  /** Who is expected to attend on the board's behalf. */
  boardRepNote: text('board_rep_note'),
  createdByUserId: integer('created_by_user_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: now(),
}, t => [
  index('events_starts_idx').on(t.startsAt),
  index('events_visibility_idx').on(t.visibility, t.published),
])

/** A seated member's attendance confirmation for an event. */
export const eventRsvps = sqliteTable('event_rsvps', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  eventId: integer('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  response: text('response', { enum: ['yes', 'no', 'maybe'] }).notNull(),
  note: text('note'),
  respondedAt: integer('responded_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
}, t => [uniqueIndex('event_rsvp_unique').on(t.eventId, t.userId)])

/* ------------------------------------------------------------------ *
 * Finance - treasurer's report
 *
 * All money is stored as INTEGER CENTS. Never floats: 0.1 + 0.2 != 0.3 in
 * binary floating point, and a board's books must reconcile exactly.
 * ------------------------------------------------------------------ */

export const accounts = sqliteTable('accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type', {
    enum: ['checking', 'savings', 'grant', 'restricted', 'petty_cash', 'reserve'],
  }).notNull().default('checking'),
  institution: text('institution'),
  /** Last 4 only - never store full account numbers. */
  lastFour: text('last_four'),
  openingBalanceCents: integer('opening_balance_cents').notNull().default(0),
  /** Restricted funds (e.g. a grant) may only be spent on their stated purpose. */
  restrictedPurpose: text('restricted_purpose'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt: now(),
})

/**
 * A single ledger entry. `amountCents` is SIGNED: positive is money in,
 * negative is money out. Transfers are written as two rows sharing a
 * `transferGroup` so both sides move together and the ledger stays balanced.
 */
export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  accountId: integer('account_id').notNull().references(() => accounts.id, { onDelete: 'restrict' }),
  occurredOn: integer('occurred_on', { mode: 'timestamp_ms' }).notNull(),
  amountCents: integer('amount_cents').notNull(),
  type: text('type', { enum: ['income', 'expense', 'transfer'] }).notNull(),
  category: text('category', {
    enum: [
      'grants', 'donations', 'sponsorship', 'ticket_sales', 'merchandise', 'interest', 'other_income',
      'programs', 'events', 'marketing', 'supplies', 'travel', 'professional_fees',
      'insurance', 'software', 'rent', 'stipends', 'bank_fees', 'other_expense',
    ],
  }).notNull(),
  payee: text('payee'),
  memo: text('memo'),
  /** Check number, invoice id, or transfer reference. */
  reference: text('reference'),
  transferGroup: text('transfer_group'),
  receiptUrl: text('receipt_url'),
  /** Spending above the treasurer's threshold must cite the motion that authorized it. */
  approvedByMotionId: integer('approved_by_motion_id').references(() => motions.id, { onDelete: 'set null' }),
  enteredByUserId: integer('entered_by_user_id').references(() => users.id, { onDelete: 'set null' }),
  reconciledAt: integer('reconciled_at', { mode: 'timestamp_ms' }),
  createdAt: now(),
}, t => [
  index('tx_account_date_idx').on(t.accountId, t.occurredOn),
  index('tx_category_idx').on(t.category),
  index('tx_transfer_idx').on(t.transferGroup),
])

export const budgetLines = sqliteTable('budget_lines', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  fiscalYear: integer('fiscal_year').notNull(),
  category: text('category').notNull(),
  /** Positive figure for both income and expense lines; `kind` gives direction. */
  amountCents: integer('amount_cents').notNull(),
  kind: text('kind', { enum: ['income', 'expense'] }).notNull().default('expense'),
  note: text('note'),
  approvedByMotionId: integer('approved_by_motion_id').references(() => motions.id, { onDelete: 'set null' }),
  createdAt: now(),
}, t => [uniqueIndex('budget_unique').on(t.fiscalYear, t.category, t.kind)])

/**
 * The treasurer's report presented at a meeting. Balances are snapshotted at
 * publication so a historical report never silently changes when a back-dated
 * transaction is entered later.
 */
export const treasurerReports = sqliteTable('treasurer_reports', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  meetingId: integer('meeting_id').references(() => meetings.id, { onDelete: 'set null' }),
  periodStart: integer('period_start', { mode: 'timestamp_ms' }).notNull(),
  periodEnd: integer('period_end', { mode: 'timestamp_ms' }).notNull(),
  openingBalanceCents: integer('opening_balance_cents').notNull(),
  incomeCents: integer('income_cents').notNull(),
  expenseCents: integer('expense_cents').notNull(),
  closingBalanceCents: integer('closing_balance_cents').notNull(),
  narrative: text('narrative'),
  preparedByUserId: integer('prepared_by_user_id').references(() => users.id, { onDelete: 'set null' }),
  /** Reports are "received and filed" or accepted by motion, not approved silently. */
  acceptedByMotionId: integer('accepted_by_motion_id').references(() => motions.id, { onDelete: 'set null' }),
  createdAt: now(),
}, t => [index('treas_meeting_idx').on(t.meetingId)])


/* ------------------------------------------------------------------ *
 * Merchandise
 * ------------------------------------------------------------------ */

/**
 * Merch catalogue. The board sells at events and through an external store
 * rather than taking card payments here, so this is a catalogue plus stock
 * count, not a checkout: `externalUrl` points at wherever money changes hands.
 * Prices are integer cents, same rule as the ledger.
 */
export const merchItems = sqliteTable('merch_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description').notNull(),
  category: text('category', {
    enum: ['apparel', 'print', 'accessory', 'music', 'bundle', 'other'],
  }).notNull().default('other'),
  priceCents: integer('price_cents').notNull(),
  imageUrl: text('image_url'),
  /** Comma-separated, e.g. "S,M,L,XL". Null for items without sizes. */
  sizes: text('sizes'),
  /** null = not tracked; 0 = sold out. */
  stockQty: integer('stock_qty'),
  /** Where to actually buy it - Square, Bandcamp, Shopify, or in person. */
  externalUrl: text('external_url'),
  availableInPerson: integer('available_in_person', { mode: 'boolean' }).notNull().default(true),
  published: integer('published', { mode: 'boolean' }).notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  createdByUserId: integer('created_by_user_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: now(),
}, t => [index('merch_published_idx').on(t.published, t.sortOrder)])


/* ------------------------------------------------------------------ *
 * Community directory - musicians and venues
 * ------------------------------------------------------------------ */

/**
 * Self-registered artists. Anyone can submit; nothing appears publicly until a
 * board member approves it, because an open directory with no gate becomes a
 * spam surface within days.
 *
 * `email` and `phone` are contact details the artist gave us for board use.
 * They are never returned by the public endpoint - only what the artist
 * explicitly chose to publish.
 */
export const musicians = sqliteTable('musicians', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  stageName: text('stage_name'),
  email: text('email').notNull(),
  phone: text('phone'),
  actType: text('act_type', {
    enum: ['solo', 'band', 'duo', 'dj', 'producer', 'composer', 'ensemble', 'other'],
  }).notNull().default('solo'),
  /** Comma-separated. Free-form on purpose - Houston's genres do not fit a fixed list. */
  genres: text('genres'),
  neighborhood: text('neighborhood'),
  bio: text('bio'),
  yearsActive: integer('years_active'),
  memberCount: integer('member_count'),
  websiteUrl: text('website_url'),
  streamingUrl: text('streaming_url'),
  socialUrl: text('social_url'),
  pressKitUrl: text('press_kit_url'),
  /** Comma-separated from a fixed set; drives the "who is looking for what" filters. */
  lookingFor: text('looking_for'),
  availableForBooking: integer('available_for_booking', { mode: 'boolean' }).notNull().default(true),
  status: text('status', { enum: ['pending', 'approved', 'rejected'] }).notNull().default('pending'),
  /** The artist's own choice to appear publicly; approval alone is not consent. */
  listed: integer('listed', { mode: 'boolean' }).notNull().default(true),
  reviewNote: text('review_note'),
  reviewedByUserId: integer('reviewed_by_user_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: now(),
}, t => [
  uniqueIndex('musicians_email_idx').on(t.email),
  index('musicians_status_idx').on(t.status, t.listed),
])

/**
 * Places that book artists. Board-maintained rather than self-serve, because
 * the value here is verified booking information - who to contact and how they
 * pay - which is exactly what goes stale or gets gamed if anyone can edit it.
 */
export const bookingVenues = sqliteTable('booking_venues', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  address: text('address'),
  neighborhood: text('neighborhood'),
  lat: text('lat'),
  lng: text('lng'),
  venueType: text('venue_type', {
    enum: ['club', 'bar', 'theater', 'listening_room', 'outdoor', 'diy', 'restaurant', 'coffee', 'arena', 'record_store', 'other'],
  }).notNull().default('club'),
  capacity: integer('capacity'),
  genresBooked: text('genres_booked'),
  /** The two questions an artist actually has. */
  acceptsSubmissions: integer('accepts_submissions', { mode: 'boolean' }).notNull().default(false),
  paysArtists: text('pays_artists', {
    enum: ['guarantee', 'door_split', 'ticket_split', 'guarantee_plus_split', 'tips_only', 'unpaid', 'varies'],
  }).notNull().default('varies'),
  bookingContactName: text('booking_contact_name'),
  bookingEmail: text('booking_email'),
  bookingPhone: text('booking_phone'),
  submissionUrl: text('submission_url'),
  submissionNotes: text('submission_notes'),
  allAges: integer('all_ages', { mode: 'boolean' }).notNull().default(false),
  hasBackline: integer('has_backline', { mode: 'boolean' }).notNull().default(false),
  hasSoundEngineer: integer('has_sound_engineer', { mode: 'boolean' }).notNull().default(false),
  stageNotes: text('stage_notes'),
  websiteUrl: text('website_url'),
  socialUrl: text('social_url'),
  published: integer('published', { mode: 'boolean' }).notNull().default(false),
  /** When the booking details were last confirmed with the venue. */
  verifiedAt: integer('verified_at', { mode: 'timestamp_ms' }),
  verifiedByUserId: integer('verified_by_user_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: now(),
}, t => [
  index('venues_published_idx').on(t.published, t.name),
  index('venues_type_idx').on(t.venueType),
])

/* ------------------------------------------------------------------ *
 * Audit
 * ------------------------------------------------------------------ */

/** Append-only trail. Board records need to show who changed what, and when. */
export const auditLog = sqliteTable('audit_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  entity: text('entity').notNull(),
  entityId: integer('entity_id'),
  detail: text('detail'),
  createdAt: now(),
}, t => [index('audit_entity_idx').on(t.entity, t.entityId)])
