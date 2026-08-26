// HMAB Network — VENUES & PLACES
// Distinct from app/data/venues.ts (the map's geocoded pins). These are every
// physical place the board's history touches; merge into the map file as
// coordinates get added.
import type { NetworkVenue } from './types'

export const networkVenues: NetworkVenue[] = [
  // ─── HMAB home turf ──────────────────────────────────────────────
  { id: 'rukaz-office', name: 'Rukaz Kultura (5503 Lawndale)', address: '5503 Lawndale St, Houston, TX 77023', area: 'East End', type: 'business', description: "Marissa Saenz's office — the board's standing meeting venue since 2025, with a rehearsal 'big space'.", hmabUse: 'Board meetings Jan 2025, Jun 2025, Jan 2026, Aug 2026' },
  { id: 'city-hall', name: 'Houston City Hall', address: '901 Bagby St, Houston, TX 77002', area: 'Downtown', type: 'civic', description: 'Anna Russell Council Chamber (2nd floor) hosts the Arts + Culture Committee; first floor hosted early board meetings and Mini Concerts.', hmabUse: 'Board meetings 2024; committee advocacy 2024-2025' },

  // ─── Listening session + workshop venues ─────────────────────────
  { id: 'cactus-music', name: 'Cactus Music', address: '2110 Portsmouth St, Houston, TX 77098', area: 'Upper Kirby', type: 'venue', description: 'Historic record store and in-store venue.', website: 'https://www.cactusmusictx.com', hmabUse: '2024 Listening Session (Oct 8 2024); contact Quinn Bishop' },
  { id: 'bad-astronaut', name: 'Bad Astronaut Brewing', address: '1519 Fulton St, Houston, TX 77009', area: 'Northside', type: 'venue', description: 'Brewery and event space.', hmabUse: '2023 Listening Session (Oct 18 2023)' },
  { id: 'deluxe-theater', name: 'The DeLuxe Theater', address: '3303 Lyons Ave, Houston, TX 77020', area: 'Fifth Ward', type: 'venue', description: 'Fifth Ward Cultural Arts District theater, run by FWCRC (Edgar Guajardo, production).', website: 'https://www.thedeluxetheater.com', hmabUse: 'Hip Hop 50th (2023), Sync Licensing Workshop (2024), DJ Screw screening (2025), QSC demo day (2026)' },
  { id: 'east-river', name: 'East River (Bayou Park)', address: '2920 Riverby / 100 Jensen Dr, Houston, TX', area: 'Fifth Ward / East End', type: 'outdoor', description: 'Mixed-use development on Buffalo Bayou, across from City Cellars.', hmabUse: 'Beats on the Bayou townhall + 2025 Listening Session (Dec 5 2025); HoustonLive Fall Music Series' },
  { id: 'east-river-9', name: 'East River 9', address: 'East River development, Houston, TX', area: 'Fifth Ward / East End', type: 'venue', description: 'Golf, pickleball, dining, live music.', website: 'https://eastriver9.com', hmabUse: 'Board hangouts; floated to host the TCMA awards in Houston' },
  { id: 'off-the-record', name: 'Off The Record', address: '416 Main St, Houston, TX 77002', area: 'Downtown', type: 'venue', description: 'Downtown music bar.', website: 'https://www.offtherecordhtx.com', hmabUse: 'Music City Forum (Mar 2024), HAA boards happy hour (Apr 2024), Heist House at AfroTech (Nov 2024)' },

  // ─── Performance venues in the network ───────────────────────────
  { id: 'white-oak-music-hall', name: 'White Oak Music Hall', address: '2915 N Main St, Houston, TX 77009', area: 'Near Northside', type: 'venue', description: 'Pegstar’s indoor/outdoor complex (Jagi Katial).', website: 'https://www.whiteoakmusichall.com', hmabUse: 'Donated for the Music Icon Awards (Dec 2024 hold)' },
  { id: 'fitzgeralds', name: "Fitzgerald's (legacy)", area: 'Heights', type: 'venue', description: 'Closed legendary venue — its former operator "Johnny" was a 2026 board nominee via Jagi.' },
  { id: 'rockefellers', name: "Rockefeller's", address: '3620 Washington Ave, Houston, TX 77007', area: 'Washington Ave', type: 'venue', description: 'Historic bank-building venue. Balcony holds ~80 (12 barstool tables); booked by Illscape Studios.', hmabUse: 'Comp balcony offered for HMAB mixers, Aug 2026 concert series' },
  { id: 'miller-outdoor-theatre', name: 'Miller Outdoor Theatre', address: '6000 Hermann Park Dr, Houston, TX 77030', area: 'Hermann Park', type: 'landmark', description: 'Free outdoor performance venue since 1923.', website: 'https://www.milleroutdoortheatre.com', hmabUse: 'Summer Mixtape picnics ($750 stipend, opening remarks); Accordion Kings & Queens; Philly Soul Sound Show' },
  { id: 'hobby-center', name: 'Hobby Center for the Performing Arts', address: '800 Bagby St, Houston, TX 77002', area: 'Downtown / Theater District', type: 'venue', description: 'Zilkha Hall + Founders Club; home of Performing Arts Houston.', website: 'https://www.thehobbycenter.org', hmabUse: 'Greater Houston Arts Forum (2025); Chicano Squad premiere; YungChris commission; Founders Club comps' },
  { id: 'post-htx', name: 'POST Houston', address: '401 Franklin St, Houston, TX 77201', area: 'Downtown', type: 'venue', description: 'Mixed-use culture hub.', hmabUse: 'New home of Houston Bluesfest (4th Annual, Oct 4 2026)' },
  { id: 'continental-club', name: 'Continental Club', address: '3700 Main St, Houston, TX 77002', area: 'Midtown', type: 'venue', description: 'Intimate live-music institution.', website: 'https://continentalclub.com/houston', hmabUse: '2023 conference closing receptions (Flash, Ichikara Valdez, The Mexican Blackbird DJ sets)' },
  { id: 'bar-by-the-wayside', name: 'Bar by the Wayside', area: 'East End', type: 'venue', description: 'Bar with a Monday Industry Night.', hmabUse: 'Candidate spot for HMAB + Friends meetups; Tracy negotiating a Nov 14 2026 music night' },
  { id: 'warehouse-live', name: 'Warehouse Live', address: '813 St Emanuel St, Houston, TX 77003', area: 'EaDo', type: 'venue', description: 'Multi-room concert venue.', website: 'https://warehouselive.com' },
  { id: 'house-of-blues', name: 'House of Blues Houston', address: '1204 Caroline St, Houston, TX 77002', area: 'Downtown', type: 'venue', description: 'Major downtown concert venue.', website: 'https://www.houseofblues.com/houston' },
  { id: 'heights-theater', name: 'The Heights Theater', address: '339 W 19th St, Houston, TX 77008', area: 'Heights', type: 'venue', description: 'Historic theater — concerts, comedy, special events.', website: 'https://theheightstheater.com' },
  { id: 'nrg-stadium', name: 'NRG Stadium', area: 'South Main', type: 'venue', description: 'Pepsi National Battle of the Bands press conference site (2025).' },
  { id: 'julep', name: 'Julep', address: '1919 Washington Ave, Houston, TX 77007', area: 'Washington Ave / Arts District', type: 'business', description: 'Bar in the Washington Avenue Arts District.', hmabUse: 'Make Music Day 2025 kickoff ceremony' },
  { id: 'toros-htx', name: 'Toros HTX', address: '2202 Summer St, Houston, TX 77007', area: 'Sawyer Yards', type: 'business', description: 'Coffee + soccer facility.', hmabUse: 'Make Music Day 2026 kickoff ceremony' },
  { id: 'ion-district', name: 'Ion District', address: '4201 Main St, Houston, TX 77002', area: 'Midtown', type: 'business', description: 'Innovation district — Ion Block Party.', hmabUse: 'Board meetup Jun 2024' },
  { id: 'camh-venue', name: 'Contemporary Arts Museum Houston', address: '5216 Montrose Blvd, Houston, TX 77006', area: 'Museum District', type: 'landmark', description: 'CAMH + plaza.', hmabUse: 'THIS WAY group show (Flash exhibited); Ebony Bar talks' },
  { id: 'match', name: 'MATCH Houston', address: '3400 Main St, Houston, TX 77002', area: 'Midtown', type: 'venue', description: 'Midtown Arts & Theater Center.', website: 'https://matchouston.org', hmabUse: '2023 Recordings + Documentation session; Chulas Fronteras 50th screening (Oct 2026)' },
  { id: 'bagby-park', name: 'Bagby Park (Midtown sign)', address: '415 Bagby St, Houston, TX 77002', area: 'Midtown', type: 'landmark', description: 'The iconic Midtown sign — wrapped in rotating artist designs ($1,500 calls: Jazz Icons, AAPI, Rodeo, FIFA).' },
  { id: 'duncan-recital-hall', name: 'Duncan Recital Hall (Rice University)', address: '6100 Main St, Houston, TX 77005', area: 'Rice / Museum District', type: 'venue', description: 'Rice’s Shepherd School hall.', hmabUse: 'Ars Lyrica Old Meets New premiere (Jan 2025, board invited)' },
  { id: 'uh-law-center', name: 'UH Law Center', address: '4170 Martin Luther King Blvd, Houston, TX 77004', area: 'Third Ward', type: 'civic', description: 'Entertainment Law Clinic — free Copyright Registration Days.' },
  { id: 'mo-better-brews-venue', name: "Mo' Better Brews", address: '1201 Southmore Blvd, Houston, TX 77004', area: 'Museum District / Third Ward', type: 'business', description: 'Flash Gordon Parks’ coffee shop.', hmabUse: 'Coffee + Music breakfasts' },
  { id: 'sugarhill-studios', name: 'SugarHill Recording Studios', address: '5626 Brock St, Houston, TX 77023', area: 'East End', type: 'studio', description: 'Historic studio (est. 1941, formerly Gold Star/Quinn) — subject of the board’s 2023 preservation focus.', website: 'https://sugarhillstudios.com' },
  { id: 'el-dorado-ballroom', name: 'El Dorado Ballroom', address: '2310 Elgin St, Houston, TX 77004', area: 'Third Ward', type: 'landmark', description: 'Historic Black music ballroom — 2023 preservation focus alongside SugarHill.' },
  { id: 'emancipation-park', name: 'Emancipation Park', address: '3018 Emancipation Ave, Houston, TX 77004', area: 'Third Ward', type: 'landmark', description: 'Historic park; 2023 Landmarks session with the Conservancy.', website: 'https://emancipationparkconservancy.org' },
  { id: 'morales-radio-hall', name: 'Morales Radio Hall', area: 'East End', type: 'landmark', description: '2023 Folk + Contemporary Artists preservation session venue.' },
  { id: 'sawyer-park-ice-house', name: 'Sawyer Park Ice House', area: 'Spring, TX', type: 'venue', description: '2024 TCMA Summit & Industry Awards venue.' },
  { id: 'hilton-americas', name: 'Hilton Americas-Houston', address: '1600 Lamar St, Houston, TX 77010', area: 'Downtown', type: 'business', description: 'HCC State of the College venue (2024).' },

  // ─── Out-of-town stops on the board's circuit ────────────────────
  { id: 'house-of-rock-cc', name: 'House of Rock', address: '511 Starr St, Corpus Christi, TX', area: 'Corpus Christi', type: 'venue', description: 'Casey Lane’s venue — TSC 2025 opening reception.' },
  { id: 'rockits-saloon-cc', name: "Rockit's Saloon", address: '709 N Chaparral St, Corpus Christi, TX', area: 'Corpus Christi', type: 'venue', description: 'TSC 2025 conference-day venue.' },
  { id: 'bus-cc', name: 'BUS', address: '702 N Chaparral St, Corpus Christi, TX', area: 'Corpus Christi', type: 'venue', description: 'TSC 2025 closing reception.' },
  { id: 'freddie-records-store', name: 'Freddie Records', area: 'Corpus Christi', type: 'landmark', description: 'Tejano label HQ — TSC 2025 tour + proclamation.' },
  { id: 'park-board-plaza', name: 'Park Board Plaza', area: 'The Strand, Galveston', type: 'civic', description: 'MFT East Regional host site (May 2025).' },
  { id: 'old-quarter-galveston', name: 'Old Quarter Acoustic Cafe', area: 'Galveston', type: 'venue', description: 'MFT East Regional tour stop.' },
  { id: 'grand-opera-house', name: '1894 Grand Opera House', area: 'Galveston', type: 'landmark', description: 'MFT East Regional tour stop.' },
  { id: 'proletariat-galveston', name: 'The Proletariat', area: 'Galveston', type: 'venue', description: 'MFT East Regional tour stop.' },
]
