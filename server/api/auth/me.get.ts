export default defineEventHandler(async (event) => {
  const admin = await currentAdmin(event)
  return { admin }
})
