export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const seat = await seatFor(user.id)
  return {
    ...user,
    seat: seat ? { id: seat.id, position: seat.position, organization: seat.organization } : null,
    canVote: !!seat,
  }
})
