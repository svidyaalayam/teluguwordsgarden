/** Where BMK users should return after viewing the Vocabulary Platform. */
const RETURN_KEY = 'bmk_return_to'

export function storeBmkReturnTo(url: string | null | undefined): void {
  const value = (url || '').trim()
  if (!value) {
    sessionStorage.removeItem(RETURN_KEY)
    return
  }
  try {
    const parsed = new URL(value)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return
    sessionStorage.setItem(RETURN_KEY, parsed.toString())
  } catch {
    // ignore invalid URLs
  }
}

export function bmkReturnToUrl(schoolSlug?: string | null): string {
  const stored = sessionStorage.getItem(RETURN_KEY)
  if (stored) return stored

  const base = (import.meta.env.VITE_BMK_APP_URL || 'http://localhost:8080').replace(/\/$/, '')
  const domain = (import.meta.env.VITE_BMK_APP_DOMAIN || 'localhost').toLowerCase()
  const slug = (schoolSlug || '').trim()
  if (!slug) return `${base}/`

  try {
    const u = new URL(base)
    const port = u.port ? `:${u.port}` : ''
    return `${u.protocol}//${slug}.${domain}${port}/`
  } catch {
    return `${base}/`
  }
}

export function goToBalamukundam(schoolSlug?: string | null): void {
  window.location.assign(bmkReturnToUrl(schoolSlug))
}

/** Read #bmk_token=...&return_to=... from the hash, then clear it. */
export function consumeSsoHash(): { token: string; returnTo: string } | null {
  const raw = window.location.hash.replace(/^#/, '')
  if (!raw) return null
  const params = new URLSearchParams(raw)
  const token = (params.get('bmk_token') || '').trim()
  const returnTo = (params.get('return_to') || '').trim()
  // Clear sensitive token from the address bar
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
  if (!token) return null
  return { token, returnTo }
}
