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
    image: '/images/timeline/1923-miller.png'
  },
  {
    year: 1925,
    title: 'KPRC Radio',
    description: 'Houston\'s first radio station begins broadcasting',
    image: '/images/timeline/1925-kprc.png'
  },
  {
    year: 1926,
    title: 'Victoria Spivey - Hallelujah',
    description: 'Houston blues singer records influential early recordings',
    image: '/images/timeline/1926-spivey.png'
  },
  {
    year: 1934,
    title: 'Lydia Mendoza',
    description: 'The "Lark of the Border" rises to fame from Houston\'s tejano music scene',
    image: '/images/timeline/1934-mendoza.png'
  },
  {
    year: 1936,
    title: 'Milt Larkin',
    description: 'Jazz bandleader establishes Houston as a jazz destination',
    image: '/images/timeline/1936-larkin.png'
  },
  {
    year: 1939,
    title: 'El Dorado Ballroom',
    description: 'Historic Third Ward venue opens, hosting major Black entertainers',
    image: '/images/timeline/1939-eldorado.png'
  },
  {
    year: 1941,
    title: 'Quinn Recording/SugarHill Studios',
    description: 'Legendary recording studio opens, later becoming SugarHill Studios',
    image: '/images/timeline/1941-quinn.png'
  },
  {
    year: 1946,
    title: 'Lightnin\' Hopkins',
    description: 'Blues legend begins recording career in Houston',
    image: '/images/timeline/1946-lightnin.png'
  },
  {
    year: 1949,
    title: 'Peacock Records',
    description: 'Don Robey founds influential R&B and gospel label in Houston',
    image: '/images/timeline/1949-peacock.png'
  },
  {
    year: '1950s',
    title: 'Joe Carmouche',
    description: 'Zydeco pioneer helps establish Houston\'s Creole music scene',
    image: '/images/timeline/1950s-carmouche.png'
  },
  {
    year: '1970s',
    title: 'ZZ Top',
    description: 'Houston\'s iconic blues rock band achieves international stardom',
    image: '/images/timeline/1970s-zztop.png'
  },
  {
    year: 1986,
    title: 'Houston Rodeo',
    description: 'Houston Livestock Show and Rodeo becomes world\'s largest',
    image: '/images/timeline/1986-rodeo.png'
  },
  {
    year: 1991,
    title: 'Geto Boys',
    description: 'Houston hip-hop pioneers achieve mainstream success',
    image: '/images/timeline/1991-getoboys.png'
  },
  {
    year: 2018,
    title: 'Houston Symphony',
    description: 'Celebrating over 100 years of orchestral excellence',
    image: '/images/timeline/2018-symphony.png'
  },
  {
    year: 'Legacy',
    title: 'Big Mama Thornton',
    description: 'Original "Hound Dog" singer and blues legend with Houston roots',
    image: '/images/timeline/bigmama.png'
  }
]

export const spotifyPlaylist = {
  title: 'Essential Houston Music',
  url: 'https://open.spotify.com/playlist/0TT1HOAfINeePthP4IhfYG?si=j4d7GtC0Qr275bJCgTRohw&pt=1c9d5d1e163157045124d5b1a45687b9',
  embedUrl: 'https://open.spotify.com/embed/playlist/0TT1HOAfINeePthP4IhfYG?utm_source=generator',
  description: 'We are compiling an essential playlist of Houston Music on Spotify to accompany the Music History Timeline. To qualify, songs must be either by Houstonians, or must have been recorded here or released on a local label.'
}
