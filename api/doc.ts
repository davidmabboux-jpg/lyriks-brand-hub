// Serverless endpoint backing the editable Stand & FAQ pages.
//
//   GET  /api/doc?id=<docId>            → { content: string|null, updatedAt }
//   GET  /api/doc?id=<docId>&versions=1 → { versions: [{ name, at }] }
//   POST /api/doc  { id, content, snapshot? } → saves current + (optional) a
//                                               dated version snapshot
//
// Storage = Supabase Storage bucket "brand-hub-docs" (private). The Supabase
// service key never leaves the server. Access is further gated by the site-wide
// HTTP Basic Auth middleware, so only logged-in team members can read/write.

// `process.env` is injected by Vercel at runtime; declare it so this file
// type-checks without pulling in @types/node.
declare const process: { env: Record<string, string | undefined> }

export const config = { runtime: 'edge' }

const BUCKET = 'brand-hub-docs'
const ALLOWED = new Set(['stand-briefing', 'stand-faq-produit', 'stand-faq-business', 'grille-editoriale'])
const MAX_BYTES = 3_000_000 // ~3 MB safety cap

const URL_BASE = () => process.env.SUPABASE_URL!
const KEY = () => process.env.SUPABASE_SERVICE_ROLE_KEY!

function authHeaders(extra?: Record<string, string>) {
  return { Authorization: `Bearer ${KEY()}`, apikey: KEY(), ...(extra ?? {}) }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })
}

async function ensureBucket() {
  // Idempotent: 200 on create, 4xx if it already exists — both fine.
  await fetch(`${URL_BASE()}/storage/v1/bucket`, {
    method: 'POST',
    headers: authHeaders({ 'content-type': 'application/json' }),
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: false }),
  }).catch(() => {})
}

async function readObject(path: string): Promise<string | null> {
  try {
    // cache-buster query + no-store: Supabase storage sits behind a CDN whose
    // read-after-write can be stale on overwrite; a unique URL bypasses it.
    const bust = `?_=${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const r = await fetch(`${URL_BASE()}/storage/v1/object/${BUCKET}/${path}${bust}`, {
      headers: authHeaders({ 'cache-control': 'no-cache' }),
      cache: 'no-store',
    })
    return r.ok ? await r.text() : null
  } catch {
    // storage unreachable (paused/deleted project) — degrade gracefully
    return null
  }
}

async function writeObject(path: string, content: string) {
  return fetch(`${URL_BASE()}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: authHeaders({ 'content-type': 'text/html; charset=utf-8', 'x-upsert': 'true' }),
    body: content,
  })
}

export default async function handler(req: Request): Promise<Response> {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return json({ error: 'storage_not_configured' }, 500)
  }

  const url = new URL(req.url)

  if (req.method === 'GET') {
    const id = url.searchParams.get('id') ?? ''
    if (!ALLOWED.has(id)) return json({ error: 'unknown_doc' }, 400)

    if (url.searchParams.get('versions')) {
      const r = await fetch(`${URL_BASE()}/storage/v1/object/list/${BUCKET}`, {
        method: 'POST',
        headers: authHeaders({ 'content-type': 'application/json' }),
        body: JSON.stringify({
          prefix: `versions/${id}/`,
          limit: 1000,
          sortBy: { column: 'name', order: 'desc' },
        }),
      })
      const list = r.ok ? ((await r.json()) as { name: string; created_at?: string }[]) : []
      return json({
        versions: list.map((o) => ({ name: o.name, at: o.created_at ?? null })),
      })
    }

    const content = await readObject(`current/${id}.html`)
    return json({ content, updatedAt: null })
  }

  if (req.method === 'POST') {
    let body: { id?: string; content?: string; snapshot?: boolean }
    try {
      body = await req.json()
    } catch {
      return json({ error: 'bad_json' }, 400)
    }
    const { id, content, snapshot } = body
    if (!id || !ALLOWED.has(id)) return json({ error: 'unknown_doc' }, 400)
    if (typeof content !== 'string') return json({ error: 'no_content' }, 400)
    if (content.length > MAX_BYTES) return json({ error: 'too_large' }, 413)

    try {
      await ensureBucket()
      const cur = await writeObject(`current/${id}.html`, content)
      if (!cur.ok) return json({ ok: false, offline: true }, 200)

      let version: string | null = null
      if (snapshot) {
        const stamp = new Date().toISOString().replace(/[:.]/g, '-')
        version = `versions/${id}/${stamp}.html`
        await writeObject(version, content)
      }
      return json({ ok: true, savedAt: new Date().toISOString(), version })
    } catch {
      // storage unreachable — tell the client to keep its local copy
      return json({ ok: false, offline: true }, 200)
    }
  }

  return json({ error: 'method_not_allowed' }, 405)
}
