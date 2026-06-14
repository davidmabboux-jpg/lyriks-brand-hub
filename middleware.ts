import { next } from '@vercel/edge'

// Shared-login gate for the whole Brand Hub (HTTP Basic Auth).
// Credentials live in Vercel env vars (HUB_USER / HUB_PASS) — never in the
// client bundle. The team uses one generic login communicated by David.
export const config = {
  // Gate everything except Vercel internals.
  matcher: '/((?!_vercel/).*)',
}

export default function middleware(request: Request) {
  const USER = process.env.HUB_USER
  const PASS = process.env.HUB_PASS

  // If no credentials are configured, fail open (don't lock everyone out).
  if (!USER || !PASS) return next()

  const header = request.headers.get('authorization')
  if (header?.startsWith('Basic ')) {
    try {
      const decoded = atob(header.slice(6))
      const sep = decoded.indexOf(':')
      const user = decoded.slice(0, sep)
      const pass = decoded.slice(sep + 1)
      if (user === USER && pass === PASS) return next()
    } catch {
      /* malformed header → fall through to 401 */
    }
  }

  return new Response('Authentification requise · Lyriks Brand Hub', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Lyriks Brand Hub", charset="UTF-8"',
    },
  })
}
