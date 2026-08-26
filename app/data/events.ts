export interface Event {
  id: number
  date: string
  title: string
  description: string
  time: string
  location: string
  category: 'meeting' | 'workshop' | 'event' | 'announcement'
  rsvpLink?: string
}

export const events: Event[] = [
  {
    id: 12,
    date: '2026-11-05',
    title: 'Texas Sounds & Cities Conference (Texas Music Office)',
    description: 'The Texas Music Office\'s annual gathering of Music Friendly Texas communities — two days of industry programming, Nov 5-6. HMAB attends representing Houston.',
    time: 'All Day',
    location: 'Dallas, TX',
    category: 'event'
  },
  {
    id: 11,
    date: '2026-10-04',
    title: '4th Annual Houston Bluesfest',
    description: 'Houston Bluesfest moves to its new home at POST Houston. Produced by HoustonLive.',
    time: 'Evening',
    location: 'POST Houston, 401 Franklin St, 77201',
    category: 'event'
  },
  {
    id: 10,
    date: '2026-08-25',
    title: 'HMAB Board Meeting',
    description: 'Regular meeting of the Houston Music Advisory Board — recruit updates, financial report, 2026 focus programming, social media metrics, and website.',
    time: '6:30-8:30PM',
    location: 'Houston, TX',
    category: 'meeting'
  },
  {
    id: 13,
    date: '2026-06-21',
    title: 'Make Music Day Houston 2026',
    description: 'The 6th annual citywide celebration of free music on the first day of summer, with FIFA World Cup-inspired programming. Kickoff ceremony at Toros HTX with a City proclamation.',
    time: '11AM',
    location: 'Multiple Locations, Houston, TX',
    category: 'event'
  },
  {
    id: 14,
    date: '2025-12-05',
    title: '2025 Listening Session — Beats on the Bayou',
    description: 'Annual public listening session held inside the Beats on the Bayou concert night at East River. Board Q&A followed by live music on the bayou.',
    time: '5:45-9PM',
    location: 'East River, 2920 Riverby St, Houston, TX',
    category: 'event'
  },
  {
    id: 1,
    date: '2024-11-13',
    title: 'Arts + Culture Committee Meeting',
    description: 'To sign up to speak, please visit Houston City Council – Committees. Monthly meetings take place on the 2nd WED of each month at 2pm CST. WATCH: Live Broadcast (HTV)',
    time: '2PM',
    location: 'Online, City Hall, 901 Bagby Street, 77002',
    category: 'meeting'
  },
  {
    id: 2,
    date: '2024-10-09',
    title: 'Arts + Culture Committee Meeting',
    description: 'To sign up to speak, please visit Houston City Council – Committees. Monthly meetings take place on the 2nd WED of each month at 2pm CST. WATCH: Live Broadcast (HTV)',
    time: '2PM',
    location: 'Online, City Hall, 901 Bagby Street, 77002',
    category: 'meeting'
  },
  {
    id: 3,
    date: '2024-10-08',
    title: '2024 Listening Session',
    description: 'Address the Music Board and MOCA at this Public Meeting. RSVP ENTRY: Click RSVP Button Above',
    time: '6-8PM',
    location: 'Cactus Music, 2110 Portsmouth, 77098',
    category: 'event',
    rsvpLink: 'https://forms.gle/Jg92Ms4wnG7ZaSXz5'
  },
  {
    id: 4,
    date: '2024-06-25',
    title: 'SoundSync Music - Music + Film: Sync Licensing Workshop',
    description: 'Workshop with Texas-based SoundSync Music founder Natalie Phan. Covers sync + music supervision; copyright + royalties; metadata; and pitching your music for placement in TV/film. Must attend if you\'re a recording artist in Houston. RSVP ENTRY: Click RSVP Button Above',
    time: '6PM',
    location: 'The Deluxe Theater, 3303 Lyons Ave, 77020',
    category: 'workshop',
    rsvpLink: 'https://forms.gle/Jg92Ms4wnG7ZaSXz5'
  },
  {
    id: 5,
    date: '2024-06-21',
    title: 'Make Music Day Houston',
    description: 'A citywide celebration of music on the 1st day of Summer. Register to participate: MakeMusicDay.org/Houston',
    time: '11AM',
    location: 'Multiple Locations, Houston, TX',
    category: 'event'
  },
  {
    id: 6,
    date: '2024-04-20',
    title: 'Copyright Registration Day',
    description: 'Musicians and artists can register a copyright of original music, photographs, artworks, poetry, manuscripts, screenplays, films, and other creative works. REGISTER: https://loom.ly/DxcYBLo',
    time: '9AM-1PM',
    location: 'UH Law Center, Clinic Offices, 4170 Martin Luther King Blvd, 77004',
    category: 'workshop'
  },
  {
    id: 7,
    date: '2024-03-17',
    title: '2024 Music City Forum with Sound Diplomacy',
    description: 'Join us for a panel discussion on the impact music can have on how cities are managed by Sound Diplomacy founder/author Shain Shapiro with local music industry and civic leaders. Limited seating available. RSVP ENTRY: HoustonMusic.EventBrite',
    time: '4PM',
    location: 'Off the Record, 416 Main Street, 77002',
    category: 'event'
  },
  {
    id: 8,
    date: '2024-02-06',
    title: '2024 Music Focus Announcement',
    description: 'Music Officer announces 2024 area(s) of focus. Based on community feedback, up to three designated topics will provide continued support for local music industry.',
    time: 'NA',
    location: 'Online',
    category: 'announcement'
  },
  {
    id: 9,
    date: '2023-12-06',
    title: '2024 Board Member Confirmations',
    description: 'The Mayor and City Council confirm new Houston Music Advisory Board members. WATCH: Live Broadcast (HTV)',
    time: '9AM',
    location: 'Online, City Hall',
    category: 'announcement'
  }
]

export const archives = {
  '2025': {
    title: '2025 Public Meetings + Community Events',
    items: [
      'Listening Session + Townhall at Beats on the Bayou, East River (12/5)',
      'Texas Sounds & Cities Conference, Corpus Christi — HMAB delegation (11/5-11/6)',
      'Miller Summer Mixtape — HMAB community picnic, Miller Outdoor Theatre (8/16)',
      'Make Music Day Houston kickoff, Julep on Washington (6/21)',
      'Arts + Culture Committee — public comment on restoring the Office of Cultural Affairs (5/22)'
    ]
  },
  '2024': {
    title: '2024 Public Meetings - Houston Music Business Development, Grants + Funding',
    items: [
      'Music Program Overview with Music Officer Gracie Chavez at City Council\'s Arts & Culture Committee, 9/11',
      'Houston Arts Alliance Grants Workshop, 7/15',
      'Music City Forum with Sound Diplomacy, 3/17'
    ]
  },
  '2023': {
    title: '2023 Public Meetings - Houston Music Preservation with Donnie Houston Podcast',
    items: [
      'Houston\'s Hip Hop 50th Anniversary – Donnie Houston + Bun B (12/13)',
      'Folk + Contemporary Artists (08/30), Morales Radio Hall',
      'Recordings + Documentation (06/28), MATCH Houston',
      'Landmarks (03/29), Emancipation Park Conservancy'
    ]
  },
  '2022': {
    title: '2022 Listening Sessions',
    items: [
      'Music Listening Session #1 (10/25)',
      'Music Listening Session #2 (11/15)'
    ]
  },
  miniConcerts: {
    title: 'Mini Concerts at City Hall',
    items: [
      'Hispanic Heritage Month: Andrea Daniela + Jazziachi Band (2023)',
      'Hip Hop 50 Special (2023)',
      'France: International Music at City Hall (2023)'
    ]
  }
}

export const musicResources = {
  grants: {
    title: 'GRANTS',
    items: [
      { name: 'Available Grants: Houston Arts Alliance', url: 'https://www.houstonartsalliance.com/' },
      { name: 'Workshops: Houston Arts Alliance', url: 'https://www.houstonartsalliance.com/' }
    ]
  },
  organizations: {
    title: 'MUSIC ORGANIZATIONS',
    items: [
      { name: 'Union: Houston Professional Musicians\' Association (AFM Local 65-699)', url: 'https://www.houstonmusicians.org/' },
      { name: 'Texas Accountants & Lawyers for the Arts', url: 'https://talarts.org/' },
      { name: 'American Society of Composers, Authors and Publishers (ASCAP)', url: 'https://www.ascap.com/' },
      { name: 'Broadcast Music, Inc. (BMI)', url: 'https://www.bmi.com/' }
    ]
  },
  permitting: {
    title: 'EVENT PERMITTING',
    items: [
      { name: 'Event Permits: City of Houston MOSE', url: 'https://www.houstontx.gov/' }
    ]
  },
  makeMusicDay: {
    title: 'MAKE MUSIC DAY',
    items: [
      { name: 'Annual Event: Make Music Day – Houston', url: 'https://www.makemusicday.org/houston/' }
    ]
  },
  cityState: {
    title: 'CITY + STATE OFFICES',
    items: [
      { name: 'Houston Mayor\'s Office of Cultural Affairs', url: 'https://www.houstontx.gov/moca/' },
      { name: 'Texas Music Office', url: 'https://gov.texas.gov/music' }
    ]
  },
  archives: {
    title: 'MUSIC ARCHIVE COLLECTION',
    items: [
      { name: 'DJ Screw Collection – University of Houston', url: 'https://libraries.uh.edu/' },
      { name: 'SwishaHouse Record Label Collection – Rice University', url: 'https://library.rice.edu/' }
    ]
  }
}
