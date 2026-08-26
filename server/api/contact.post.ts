// Public contact form — rate-limited, honeypot-guarded, delivered to the
// board inbox via Resend. Replaces the dead Netlify Forms wiring.
function esc(v: unknown): string {
  return String(v ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
}

export default defineEventHandler(async (event) => {
  const db = getDatabase(event)
  if (!(await checkRateLimit(db, `contact:${clientIp(event)}`, 5, 10 * 60_000))) {
    throw createError({ statusCode: 429, statusMessage: 'Too many messages — please try again shortly.' })
  }

  const body = await readBody<{ name?: string; email?: string; phone?: string; message?: string; 'bot-field'?: string }>(event)

  // Honeypot: bots fill it, humans never see it. Pretend success.
  if (body['bot-field']) return { ok: true }

  const name = (body.name || '').trim().slice(0, 200)
  const email = (body.email || '').trim().slice(0, 200)
  const message = (body.message || '').trim().slice(0, 5000)
  if (!name || !email.includes('@') || !message) {
    throw createError({ statusCode: 400, statusMessage: 'Name, a valid email, and a message are required.' })
  }

  await sendEmail(event, {
    to: 'hmabtx@gmail.com',
    subject: `houston-music.live contact: ${name}`,
    html: `<div style="font-family:-apple-system,sans-serif;max-width:560px">
      <h3>New message from the HMAB site</h3>
      <p><b>Name:</b> ${esc(name)}<br>
      <b>Email:</b> ${esc(email)}<br>
      ${body.phone ? `<b>Phone:</b> ${esc(body.phone)}<br>` : ''}</p>
      <p style="white-space:pre-wrap">${esc(message)}</p>
    </div>`,
  })

  return { ok: true }
})
