/** Money is integer cents everywhere. These are the only conversion points. */

export function centsToDollars(cents: number): string {
  const sign = cents < 0 ? '-' : ''
  const abs = Math.abs(cents)
  return `${sign}$${Math.floor(abs / 100).toLocaleString('en-US')}.${String(abs % 100).padStart(2, '0')}`
}

/** Parses "1,234.56" / "$1234.5" / "-12" into cents. Throws on anything else. */
export function dollarsToCents(input: string | number): number {
  if (typeof input === 'number') {
    if (!Number.isFinite(input)) throw createError({ statusCode: 400, statusMessage: 'Invalid amount' })
    return Math.round(input * 100)
  }
  const cleaned = input.replace(/[$,\s]/g, '')
  if (!/^-?\d+(\.\d{1,2})?$/.test(cleaned)) {
    throw createError({ statusCode: 400, statusMessage: `Invalid amount: ${input}` })
  }
  const negative = cleaned.startsWith('-')
  const [whole, frac = ''] = cleaned.replace('-', '').split('.')
  const cents = Number(whole) * 100 + Number(frac.padEnd(2, '0'))
  return negative ? -cents : cents
}
