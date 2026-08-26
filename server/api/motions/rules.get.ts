import { MOTION_RULES } from '~~/server/utils/motions'

/** The motion catalogue, so the UI can render the correct options and help text. */
export default defineEventHandler(async () => {
  return Object.entries(MOTION_RULES).map(([kind, rule]) => ({ kind, ...rule }))
})
