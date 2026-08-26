export default defineEventHandler(async (event) => {
  const sessionId = await readSessionCookie(event)
  if (sessionId) {
    await getDatabase(event).prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run()
  }
  clearSessionCookie(event)
  return { ok: true }
})
