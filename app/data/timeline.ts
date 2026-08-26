export interface TimelineEvent {
  year: number | string
  title: string
  description: string
  image?: string
}

export const timelineEvents: TimelineEvent[] = [
  {
    year: 1923,
    title: 'Miller Outdoor Theater',
    description: 'Opening of iconic outdoor performance venue in Hermann Park',
  },
  {
    year: 1925,
    title: 'KPRC Radio',
    description: 'Houston\'s first radio station begins broadcasting',
  },
  {
    year: 1926,
    title: 'Victoria Spivey - Hallelujah',
    description: 'Houston blues singer records influential early recordings',
  },
  {
    year: 1934,
    title: 'Lydia Mendoza',
    description: 'The "Lark of the Border" rises to fame from Houston\'s tejano music scene',
  },
  {
    year: 1936,
    title: 'Milt Larkin',
    description: 'Jazz bandleader establishes Houston as a jazz destination',
  },
  {
    year: 1939,
    title: 'El Dorado Ballroom',
    description: 'Historic Third Ward venue opens, hosting major Black entertainers',
  },
  {
    year: 1941,
    title: 'Quinn Recording/SugarHill Studios',
    description: 'Legendary recording studio opens, later becoming SugarHill Studios',
  },
  {
    year: 1946,
    title: 'Lightnin\' Hopkins',
    description: 'Blues legend begins recording career in Houston',
  },
  {
    year: 1949,
    title: 'Peacock Records',
    description: 'Don Robey founds influential R&B and gospel label in Houston',
  },
  {
    year: '1950s',
    title: 'Joe Carmouche',
    description: 'Zydeco pioneer helps establish Houston\'s Creole music scene',
  },
  {
    year: '1970s',
    title: 'ZZ Top',
    description: 'Houston\'s iconic blues rock band achieves international stardom',
  },
  {
    year: 1986,
    title: 'Houston Rodeo',
    description: 'Houston Livestock Show and Rodeo becomes world\'s largest',
  },
  {
    year: 1991,
    title: 'Geto Boys',
    description: 'Houston hip-hop pioneers achieve mainstream success',
  },
  {
    year: 2018,
    title: 'Houston Symphony',
    description: 'Celebrating over 100 years of orchestral excellence',
  },
  {
    year: 'Legacy',
    title: 'Big Mama Thornton',
    description: 'Original "Hound Dog" singer and blues legend with Houston roots',
  }
]

export const spotifyPlaylist = {
  title: 'Essential Houston Music',
  url: 'https://open.spotify.com/playlist/0TT1HOAfINeePthP4IhfYG?si=j4d7GtC0Qr275bJCgTRohw&pt=1c9d5d1e163157045124d5b1a45687b9',
  embedUrl: 'https://open.spotify.com/embed/playlist/0TT1HOAfINeePthP4IhfYG?utm_source=generator',
  description: 'We are compiling an essential playlist of Houston Music on Spotify to accompany the Music History Timeline. To qualify, songs must be either by Houstonians, or must have been recorded here or released on a local label.'
}
