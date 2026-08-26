// HMAB Network Graph — entry point
// Databases by category, extracted 2026-08-26 from the board's email history
// (~450 messages, 2017-2026). See types.ts for node shapes.
//
// NOT exported here: ./contacts.ts — the private contact directory is
// gitignored and must never be imported by site pages.

export * from './types'
export { people } from './people'
export { organizations } from './organizations'
export { networkVenues } from './venues'
export { networkEvents } from './events'
export { programs } from './programs'
