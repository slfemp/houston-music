/** Shared helpers for the board console. */

// Session state comes from the magic-link cookie via /api/auth/me;
// the board middleware populates this state before any console page renders.
export function useBoardUser() {
  const user = useState<{ id: number; email: string; name: string; role: string } | null>('board-user', () => null)
  const role = computed(() => user.value?.role ?? 'member')

  return {
    user,
    role,
    isAdmin: computed(() => role.value === 'admin'),
    /** Officers and admins run meetings and record votes. */
    isOfficer: computed(() => ['admin', 'officer'].includes(role.value)),
    /** Officers, admins, and staff draft agendas, events, merch and minutes. */
    canEdit: computed(() => ['admin', 'officer', 'staff'].includes(role.value)),
  }
}

export function formatDateTime(value: string | number | Date | null | undefined, opts: Intl.DateTimeFormatOptions = {}) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago', ...opts,
  })
}

export function formatDate(value: string | number | Date | null | undefined) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/Chicago',
  })
}

/** Turns an enum_value into "Enum value" for display. */
export function humanize(value: string | null | undefined) {
  if (!value) return ''
  return value.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())
}

/** Surfaces the server's statusMessage, which carries the parliamentary reason. */
export function apiError(err: any): string {
  return err?.data?.statusMessage || err?.statusMessage || err?.data?.message || err?.message || 'Something went wrong'
}
