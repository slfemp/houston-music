// HMAB Network — PROGRAMS, GRANTS & INITIATIVES
import type { NetworkProgram } from './types'

export const programs: NetworkProgram[] = [
  // ─── The board's own machinery ───────────────────────────────────
  { id: 'hmab-ordinance', name: 'HMAB City Ordinance 2022-694', type: 'civic-program', org: 'hmab', description: 'The board’s legal foundation (Sept 14, 2022; Code of Ordinances Ch.2 Art.XI Div.6) — drafted by Gracie Chávez, unanimously approved by City Council. Board #44259 in the Boards & Commissions system.' },
  { id: 'listening-sessions', name: 'HMAB Listening Sessions', type: 'civic-program', org: 'hmab', description: 'Annual public-input town halls: Bad Astronaut (2023), Cactus Music (2024), East River / Beats on the Bayou (2025). 422 respondents in the 2023 cycle.' },
  { id: 'music-directory', name: 'Houston Music Directory', type: 'civic-program', org: 'hmab', description: 'Public directory of local musicians, venues, and music businesses at houston-music.live/music-directory.', links: ['https://www.houston-music.live/music-directory'] },
  { id: 'icon-awards', name: 'Houston Music Icon Awards', type: 'award', org: 'hmab', description: 'Planned award show — Posthumous + Living Legend categories; White Oak Music Hall donated; Host Committee ran Oct 2024-Feb 2025; still unproduced.' },
  { id: 'coffee-music', name: 'Coffee + Music', type: 'initiative', org: 'hmab', description: 'Standing breakfast circle at Mo’ Better Brews connecting board, HCC, and music historians.' },
  { id: 'sxsw-activations', name: 'Pre/Post-SXSW Houston Activations', type: 'initiative', org: 'hmab', description: '2024 priority: pre-SXSW event (Mar 7-9) and the post-SXSW Music City Forum (Mar 17).' },
  { id: 'wellness-music-fest', name: 'Wellness Music Fest', type: 'initiative', org: 'el-centro-de-corazon', description: 'Lupe’s planned festival with El Centro de Corazón — flagship of the Healthcare/Wellness focus (target Spring 2027).' },

  // ─── City of Houston ─────────────────────────────────────────────
  { id: 'music-officer', name: 'Music & Cultural Tourism Officer (City of Houston)', type: 'civic-program', org: 'moca', description: 'The founding city music role (Gracie, 2022-2025). Vacant since MOCA’s dissolution — refilling it is the board’s #1 civic ask.' },
  { id: 'let-creativity-happen', name: 'Let Creativity Happen Grants', type: 'grant', org: 'moca', description: 'Mayor’s office micro-grants — $71,500 to 29 creatives in 2024 (Dria awarded).' },
  { id: 'mini-concerts-city-hall', name: 'Mini Concerts at City Hall', type: 'civic-program', org: 'moca', description: 'Lunchtime concert series: Hispanic Heritage (Andrea Daniela + Jazziachi), Hip Hop 50 Special, International Music (France).' },
  { id: 'sound-diplomacy-assessment', name: 'Houston Music Census & Assessment (Sound Diplomacy)', type: 'survey', org: 'sound-diplomacy', description: '$50K mayoral commitment (Sept 2024) toward a $210K full assessment — executive summary, report, and action plan. Fort Worth (2021) and Tulsa are the comparables.' },
  { id: 'thrive-storefront', name: 'Thrive Storefront Grant Program', type: 'grant', org: 'downtown-houston-plus', description: 'Downtown Houston+ small-business incentive (Fall 2024).' },

  // ─── State of Texas ──────────────────────────────────────────────
  { id: 'music-friendly-texas', name: 'Music Friendly Texas Certification', type: 'certification', org: 'tmo', description: 'TMO community certification. Houston is certified — and at risk without a Music Officer. Regional chapter meetings (East Regional: Bryan 2024, Galveston 2025).' },
  { id: 'tsc-conference', name: 'Texas Sounds & Cities Conference', type: 'conference-series', org: 'tmo', description: 'TMO’s annual gathering of music-friendly communities: 2023 Houston-area, 2025 Corpus Christi, 2026 Dallas (Nov 5-6).' },
  { id: 'tmir', name: 'Texas Music Incubator Rebate (TMIR)', type: 'grant', org: 'tmo', description: 'State rebate for live-music venues and promoters (mixed-beverage tax rebate).' },
  { id: 'tmo-grants', name: 'Music License Plate + Education & Community Grants', type: 'grant', org: 'tmo', description: 'TMO grant programs (Steve Ray, Special Projects).' },
  { id: 'texas-music-history-trail', name: 'Texas Music History Trail', type: 'initiative', org: 'texas-historical-commission', description: 'Heritage-tourism trail (Sarah Page, THC).' },

  // ─── Grants & residencies in the network ─────────────────────────
  { id: 'levitt-festival-grants', name: 'Levitt Foundation Festival Grants', type: 'grant', org: 'levitt-foundation', description: 'Up to $5K for free outdoor music festivals (501(c)(3) + open lawn required); 2026 cycle closed Jan 30.', links: ['https://levitt.org/festivals'] },
  { id: 'midtown-micro-grants', name: 'midtownHOU Arts Micro Grants', type: 'grant', org: 'midtown-district', description: 'Cycle 1 "Art That Works": 8×$2,500 individual + 2×$5,000 org grants.' },
  { id: 'midtown-residency', name: 'Midtown Artist-in-Residency', type: 'residency', org: 'midtown-district', description: '4-month residency, $20K stipend (Cycle 1 Apr-Jul 2026); April Cultural Arts Mixer presentation slot.' },
  { id: 'midtown-sign-calls', name: 'Midtown Sign Design Calls (Bagby Park)', type: 'initiative', org: 'midtown-district', description: '$1,500 honoraria for 3M vinyl wraps of the Midtown sign — Jazz Icons centennial, AAPI Heritage, Rodeo, FIFA World Cup themes. HMAB members judge.' },
  { id: 'houston-is-inspired', name: 'Houston Is Inspired Residency (Hobby Center)', type: 'residency', org: 'performing-arts-houston', description: '$20K residency, 2026-2027 open call.' },
  { id: 'artist-survey', name: 'Greater Houston Artist Survey', type: 'survey', org: 'fresh-arts', description: 'Fresh Arts + SMU DataArts (2021 pilot → 2026 full study). HMAB was paid $1,000 to push its tracked link; first 500 respondents got $25 gift cards.', links: ['https://fresharts.org/greater-houston-artist-survey/'] },
  { id: 'haa-grants', name: 'Houston Arts Alliance Grants + Workshops', type: 'grant', org: 'haa', description: 'The city’s main artist grant channel; grants workshop July 2024.' },

  // ─── Recurring festivals & series (network anchors) ──────────────
  { id: 'make-music-day', name: 'Make Music Day Houston', type: 'civic-program', org: 'make-music-alliance', description: 'Free citywide music every June 21, led locally by Fresh Arts since 2022; kickoff ceremonies double as the board’s summer press moment.', links: ['https://www.makemusicday.org/houston'] },
  { id: 'houston-bluesfest', name: 'Houston Bluesfest', type: 'conference-series', org: 'houstonlive', description: 'Tracy’s annual festival — 2nd (2024), 3rd (2025), 4th at POST Houston (Oct 4 2026).', links: ['https://houstonbluesfest.com'] },
  { id: 'miller-summer-mixtape', name: 'Miller Summer Mixtape', type: 'conference-series', org: 'miller-outdoor-theatre-org', description: 'Annual local-band showcase at Miller; HMAB hosts a picnic and delivers opening remarks.' },
  { id: 'east-river-series', name: 'East River Fall Music Series', type: 'conference-series', org: 'houstonlive', description: 'Monthly free shows at East River, booked with Dria.' },
  { id: 'nbotb', name: 'Pepsi National Battle of the Bands', type: 'conference-series', org: 'webber-marketing', description: 'HBCU band showcase at NRG — multi-year MOCA partner.' },
  { id: 'sound-development', name: 'Sound Development (Sound Diplomacy)', type: 'conference-series', org: 'sound-diplomacy', description: 'Cultural-infrastructure forum series — LA edition Feb 2026 with a Houston delegation.' },
  { id: 'tcma-awards', name: 'TCMA Summit & Industry Awards', type: 'award', org: 'tcma', description: 'Texas Country Music Association annual awards (Tracy 2024 finalist).' },
  { id: 'art-of-taxes', name: 'The Art of Taxes (TALA)', type: 'initiative', org: 'tala', description: 'Free annual artist tax education.' },
  { id: 'copyright-days', name: 'Copyright Registration Days (UH Law)', type: 'initiative', org: 'uh-ent-law-clinic', description: 'Free copyright registration clinics for Houston creatives.' },
  { id: 'breaking-for-gold', name: 'Breaking for Gold USA', type: 'civic-program', org: 'breaking-for-gold-usa', description: 'Olympic breaking pathway (Paris 2024) — Ericka chairs competition sanctioning.' },
  { id: 'music-archives', name: 'Houston Music Archive Collections', type: 'initiative', description: 'DJ Screw Collection at UH Libraries — the institutional memory the board’s preservation work points to.' },
]
