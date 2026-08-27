// HMAB video archive — REAL recordings only, recovered from the original
// houston-music.live embeds. Add a video by appending an entry with its
// YouTube ID; the /videos page picks it up automatically.
export interface BoardVideo {
  id: string // YouTube video id
  title: string
  caption: string
  year: number
  captionLink?: string
}

export const videos: BoardVideo[] = [
  {
    id: 'sPVuB_bNR4E',
    title: 'Houston Music City Forum 2024',
    caption: 'HMAB presents the Houston Music City Forum — full program recorded by Elliot Guidry, 2024.',
    year: 2024,
  },
  {
    id: 'mk9gn_cSXAQ',
    title: 'Music City Forum with Sound Diplomacy',
    caption: 'Sound Diplomacy founder Shain Shapiro with Houston music industry and civic leaders on what music does for cities. Recorded live at Off the Record, 2024.',
    year: 2024,
    captionLink: 'https://www.sounddiplomacy.com',
  },
  {
    id: '0lFxo7MZAD0',
    title: '2024 Houston Music Listening Session',
    caption: 'The annual public listening session with the Houston Music Advisory Board and community. Recorded live at Cactus Music, 2024.',
    year: 2024,
  },
  {
    id: 'fA0SVrftmds',
    title: 'Music + Film: Sync Licensing Workshop (SoundSync)',
    caption: 'SoundSync Music founder Natalie Phan on sync, supervision, copyright, royalties, and pitching for TV/film. Recorded live at The DeLuxe Theater, 2024.',
    year: 2024,
    captionLink: 'https://www.soundsyncmusic.com/',
  },
  {
    id: 'AZizCV7r0EI',
    title: "Houston's Hip Hop 50th Anniversary (Full Show)",
    caption: 'Hosted by Bun B and Donnie Houston — decade-by-decade panels of the people who built Houston hip hop. The DeLuxe Theater, December 2023.',
    year: 2023,
  },
  {
    id: 'AIdIQgEVkQ0',
    title: 'Houston Hip Hop 50th Anniversary Special (HTV)',
    caption: "Houston Television's special on the Hip Hop 50th celebration, 2023.",
    year: 2023,
  },
  {
    id: 'bFejVYhHfnk',
    title: 'Preserving Houston — Recordings + Documentation Panel',
    caption: 'Lance Scott Walker, Russel "The Are" Gonzalez, and Felicia Johnson on preserving Houston music history, with the Donnie Houston Podcast. MATCH Houston, 2023.',
    year: 2023,
  },
  {
    id: 'jUR-kb2WuTo',
    title: 'City of Houston Offers Support to Local Musicians',
    caption: "NTD Houston's news feature on the city's new music board and the inaugural listening sessions, 2022.",
    year: 2022,
  },
]
