// Board-internal documents, streamed from R2 behind auth. The Guidelines
// Handbook is explicitly not-for-public — it must never live in public/.
export default defineEventHandler(async (event) => {
  await requireUser(event)
  const name = getRouterParam(event, 'name')
  if (!name || name.includes('..')) throw createError({ statusCode: 400, statusMessage: 'Bad document name' })

  const cf = (event.context as Record<string, any>).cloudflare
  const bucket = cf?.env?.DOCS as R2Bucket | undefined
  if (!bucket) throw createError({ statusCode: 500, statusMessage: 'Document store not available' })

  const obj = await bucket.get(decodeURIComponent(name))
  if (!obj) throw createError({ statusCode: 404, statusMessage: 'Document not found' })

  setHeader(event, 'Content-Type', obj.httpMetadata?.contentType || 'application/octet-stream')
  setHeader(event, 'Content-Disposition', `inline; filename="${decodeURIComponent(name).split('/').pop()}"`)
  setHeader(event, 'Cache-Control', 'private, max-age=3600')
  return obj.body
})
