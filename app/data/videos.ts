// HMAB video archive — REAL recordings only. Add a video by appending an
// entry with its YouTube ID; the /videos page picks it up automatically.
export interface BoardVideo {
  id: string // YouTube video id
  title: string
  caption: string
  year: number
  captionLink?: string
}

export const videos: BoardVideo[] = [
  {
    id: 'fA0SVrftmds',
    title: 'Music + Film: Sync Licensing Workshop',
    caption: 'SoundSync Music founder Natalie Phan on sync, supervision, copyright, royalties, and pitching for TV/film. Recorded live at The DeLuxe Theater, 2024.',
    year: 2024,
    captionLink: 'https://www.soundsyncmusic.com/',
  },
  // Add when the recording links are in hand:
  // { id: '', title: '2024 Listening Session', caption: 'Recorded live at Cactus Music…', year: 2024 },
  // { id: '', title: 'Music City Forum with Sound Diplomacy', caption: 'Recorded live at Off the Record…', year: 2024 },
  // { id: '', title: "Houston's Hip Hop 50th Anniversary", caption: 'Recorded live at The DeLuxe Theater…', year: 2023 },
  // { id: '', title: '2022 Inaugural Listening Session', caption: '…', year: 2022 },
]
