// HMAB Network Graph — shared types
// Built 2026-08-26 from the board's email history (2017-2026).
// Every record is a NODE in the Houston music network. String ids are
// kebab-case slugs and are referenced across files (person <-> org <-> venue <-> event).

export type BoardStatus =
  | 'founder'
  | 'officer'
  | 'member'
  | 'alternate'
  | 'alumni'
  | 'candidate'
  | 'associate' // in the board's working orbit but never seated

export interface NetworkPerson {
  id: string
  name: string
  aka?: string[]
  boardStatus?: BoardStatus
  boardRole?: string // e.g. 'Chair', 'Treasurer'
  organizations: string[] // org ids
  roles: string[]
  notes?: string
  links?: string[]
}

export interface NetworkOrg {
  id: string
  name: string
  type:
    | 'city' // City of Houston office/department
    | 'state' // Texas state office/agency
    | 'civic' // other municipal/district/CVB bodies
    | 'nonprofit'
    | 'business'
    | 'label'
    | 'media'
    | 'association'
    | 'education'
    | 'consultancy'
    | 'brand' // sponsor brands
  description: string
  people?: string[] // person ids
  website?: string
}

export interface NetworkVenue {
  id: string
  name: string
  address?: string
  area?: string // neighborhood / city
  type: 'venue' | 'studio' | 'landmark' | 'business' | 'civic' | 'outdoor'
  description: string
  website?: string
  hmabUse?: string // how the board has actually used this venue
}

export interface NetworkEvent {
  id: string
  name: string
  date: string // ISO where known; 'YYYY-MM' or 'YYYY' when fuzzy
  venueId?: string
  location?: string // freeform when no venue node exists
  category:
    | 'board-meeting'
    | 'listening-session'
    | 'workshop'
    | 'concert'
    | 'festival'
    | 'conference'
    | 'ceremony'
    | 'mixer'
    | 'screening'
    | 'civic'
    | 'fundraiser'
  description: string
  people?: string[] // person ids involved
  orgs?: string[] // org ids involved
  links?: string[]
}

export interface NetworkProgram {
  id: string
  name: string
  type: 'grant' | 'certification' | 'civic-program' | 'conference-series' | 'award' | 'survey' | 'residency' | 'initiative'
  org?: string // owning org id
  description: string
  links?: string[]
}
