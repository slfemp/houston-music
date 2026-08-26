// Send an email via Resend. No-ops (returns false) if no key is configured,
// so local dev works without email set up.
export async function sendEmail(event: import('h3').H3Event, opts: {
  to: string | string[]
  subject: string
  html: string
  from?: string
}): Promise<boolean> {
  const key = cfEnv(event, 'NUXT_RESEND_API_KEY')
  if (!key) return false
  await $fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: {
      from: opts.from || 'Houston Music Advisory Board <noreply@houstonmusicadvisoryboard.com>',
      to: Array.isArray(opts.to) ? opts.to : [opts.to],
      subject: opts.subject,
      html: opts.html,
    },
  })
  return true
}
