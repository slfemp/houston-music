export interface Venue {
  id: number
  name: string
  address: string
  lat: number
  lng: number
  type: 'venue' | 'studio' | 'landmark' | 'business'
  description: string
  website?: string
}

export const venues: Venue[] = [
  {
    id: 1,
    name: 'Cactus Music',
    address: '2110 Portsmouth St, Houston, TX 77098',
    lat: 29.7365,
    lng: -95.4046,
    type: 'venue',
    description: 'Historic music store and venue, hosting live performances and listening sessions',
    website: 'https://www.cactusmusictx.com/'
  },
  {
    id: 2,
    name: 'White Oak Music Hall',
    address: '2915 N Main St, Houston, TX 77009',
    lat: 29.7793,
    lng: -95.3859,
    type: 'venue',
    description: 'Premier indoor/outdoor concert venue in the Heights',
    website: 'https://www.whiteoakmusichall.com/'
  },
  {
    id: 3,
    name: 'The Heights Theater',
    address: '339 W 19th St, Houston, TX 77008',
    lat: 29.8024,
    lng: -95.3988,
    type: 'venue',
    description: 'Historic theater hosting concerts, comedy, and special events',
    website: 'https://theheightstheater.com/'
  },
  {
    id: 4,
    name: 'The Deluxe Theater',
    address: '3303 Lyons Ave, Houston, TX 77020',
    lat: 29.7697,
    lng: -95.3349,
    type: 'venue',
    description: 'Cultural arts venue in Fifth Ward',
    website: 'https://www.thedeluxetheater.com/'
  },
  {
    id: 5,
    name: 'Off the Record',
    address: '416 Main Street, Houston, TX 77002',
    lat: 29.7580,
    lng: -95.3632,
    type: 'venue',
    description: 'Downtown music venue and bar',
    website: 'https://www.offtherecordhtx.com/'
  },
  {
    id: 6,
    name: 'Miller Outdoor Theatre',
    address: '6000 Hermann Park Dr, Houston, TX 77030',
    lat: 29.7222,
    lng: -95.3905,
    type: 'landmark',
    description: 'Iconic outdoor performance venue in Hermann Park since 1923',
    website: 'https://www.milleroutdoortheatre.com/'
  },
  {
    id: 7,
    name: 'MATCH Houston',
    address: '3400 Main St, Houston, TX 77002',
    lat: 29.7381,
    lng: -95.3829,
    type: 'venue',
    description: 'Midtown Arts & Theater Center Houston - multi-venue arts complex',
    website: 'https://matchouston.org/'
  },
  {
    id: 8,
    name: 'Emancipation Park',
    address: '3018 Dowling St, Houston, TX 77004',
    lat: 29.7350,
    lng: -95.3565,
    type: 'landmark',
    description: 'Historic park and cultural landmark in Third Ward',
    website: 'https://emancipationparkconservancy.org/'
  },
  {
    id: 9,
    name: 'SugarHill Recording Studios',
    address: '5626 Brock St, Houston, TX 77023',
    lat: 29.7181,
    lng: -95.3272,
    type: 'studio',
    description: 'Historic recording studio, formerly Gold Star/Quinn Recording (est. 1941)',
    website: 'https://sugarhillstudios.com/'
  },
  {
    id: 10,
    name: 'House of Blues Houston',
    address: '1204 Caroline St, Houston, TX 77002',
    lat: 29.7516,
    lng: -95.3588,
    type: 'venue',
    description: 'Major concert venue in downtown Houston',
    website: 'https://www.houseofblues.com/houston'
  },
  {
    id: 11,
    name: 'Continental Club',
    address: '3700 Main St, Houston, TX 77002',
    lat: 29.7350,
    lng: -95.3833,
    type: 'venue',
    description: 'Intimate live music venue in Midtown',
    website: 'https://continentalclub.com/houston'
  },
  {
    id: 12,
    name: 'Warehouse Live',
    address: '813 St Emanuel St, Houston, TX 77003',
    lat: 29.7519,
    lng: -95.3525,
    type: 'venue',
    description: 'Multi-room concert venue in EaDo',
    website: 'https://warehouselive.com/'
  }
]

export const venueTypes = {
  venue: { label: 'Performance Venue', color: '#8b5cf6' },
  studio: { label: 'Recording Studio', color: '#f59e0b' },
  landmark: { label: 'Historic Landmark', color: '#10b981' },
  business: { label: 'Music Business', color: '#3b82f6' }
}
