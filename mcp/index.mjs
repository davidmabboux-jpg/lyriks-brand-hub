#!/usr/bin/env node
// ============================================================
// lyriks-calendar MCP
// CRUD sur les publications de la Grille éditoriale du Brand Hub.
// Lit/écrit le MÊME document que le calendrier web (via /api/doc),
// donc les changements LLM ↔ calendrier sont partagés.
// ============================================================
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

// ---- config ----
const BASE = (process.env.BRANDHUB_URL || 'https://lyriks-brand-hub.vercel.app').replace(/\/$/, '')
const USER = process.env.BRANDHUB_USER || 'lyriks'
const PASS = process.env.BRANDHUB_PASS || '' // défini via variable d'env (jamais en dur)
const DOC_ID = process.env.BRANDHUB_DOC || 'grille-editoriale'
const AUTH = 'Basic ' + Buffer.from(`${USER}:${PASS}`).toString('base64')

// ---- data helpers ----
const uid = () => 'x' + Math.random().toString(36).slice(2, 9)
const STATUS = { draft: 'draft', brouillon: 'draft', valide: 'valide', validated: 'valide', 'validé': 'valide', publie: 'publie', published: 'publie', 'publié': 'publie', planifie: 'valide' }
const STATUS_LABEL = { draft: 'DRAFT', valide: 'VALIDATED', publie: 'PUBLISHED' }
const normStatus = (s) => STATUS[String(s || 'draft').toLowerCase().trim()] || 'draft'
const PALETTE = ['#0066FF', '#8047F4', '#BB46F5', '#FA5FB2', '#FFA101', '#1FA98A', '#E0218A', '#9097A2']

const DEFAULT_SEGMENTS = [
  ['Page LYRIKS', '2/sem', [['Retour d\'expérience', '#FA5FB2'], ['Choix technologiques & architecture', '#0066FF'], ['Fonctionnalités', '#0066FF'], ['Process & ways of working', '#FFA101'], ['Données propres en contexte', '#0066FF'], ['Présence salons / événements', '#FA5FB2'], ['Point de vue / décryptage marché', '#FFA101'], ['Preuve & chiffres', '#8047F4']]],
  ['Adrien Charles — CTO', 'surpond. Tech', [['Architecture produit & dette technique', '#FFA101'], ['Vibe coding et ses pièges', '#FFA101'], ['Choix de stack & outils IA dev', '#0066FF'], ['Qualité du code IA & code review', '#0066FF'], ['Verdicts d\'ingénierie', '#FFA101'], ['Repartage LYRIKS', '#0066FF']]],
  ['Adrien Basso — CEO', 'surpond. Data', [['Modèle de données & logique métier', '#0066FF'], ['Données propres en contexte', '#0066FF'], ['Cohérence de la donnée', '#0066FF'], ['Représentation du système', '#0066FF'], ['Gouvernance & traçabilité', '#8047F4'], ['Repartage LYRIKS', '#0066FF']]],
  ['David Mabboux', 'surpond. ROI', [['Coût réel de l\'IA & FinOps IA', '#8047F4'], ['Marge, rework évité, refontes évitées', '#8047F4'], ['ROI du dev assisté par IA', '#8047F4'], ['Décision d\'investissement tooling', '#8047F4'], ['Vision business & cap stratégique', '#FA5FB2'], ['Repartage LYRIKS', '#0066FF']]],
  ['Newsletter — Le Brief', '1/mois', [['Édito du mois', '#8047F4'], ['Sélection & liens', '#8047F4']]],
]
function defaultModel() {
  return { gran: 'semaine', segments: DEFAULT_SEGMENTS.map(([name, note, subs]) => ({ id: uid(), name, note, subsegments: subs.map(([n, c]) => ({ id: uid(), name: n, color: c })) })), posts: [] }
}

async function loadModel() {
  const r = await fetch(`${BASE}/api/doc?id=${encodeURIComponent(DOC_ID)}`, { headers: { authorization: AUTH, accept: 'application/json' } })
  if (r.status === 401) throw new Error('Auth refusée par le Brand Hub (BRANDHUB_USER / BRANDHUB_PASS).')
  if (!r.ok) throw new Error(`Lecture impossible (${r.status}).`)
  const d = await r.json()
  if (d && typeof d.content === 'string' && d.content.trim()) {
    try { return JSON.parse(d.content) } catch { /* fall through */ }
  }
  return null
}
async function ensureModel() {
  let m = await loadModel()
  if (!m) { m = defaultModel(); await saveModel(m) }
  if (!Array.isArray(m.segments)) m.segments = []
  if (!Array.isArray(m.posts)) m.posts = []
  return m
}
async function saveModel(model) {
  const r = await fetch(`${BASE}/api/doc`, {
    method: 'POST', headers: { authorization: AUTH, 'content-type': 'application/json' },
    body: JSON.stringify({ id: DOC_ID, content: JSON.stringify(model), snapshot: true }),
  })
  const d = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(`Sauvegarde impossible (${r.status}).`)
  return d // {ok:true} or {ok:false,offline:true}
}

const norm = (s) => String(s || '').toLowerCase().trim()
function findSegment(model, name) {
  const q = norm(name)
  return model.segments.find(s => norm(s.name) === q) || model.segments.find(s => norm(s.name).includes(q)) || null
}
function findSub(model, segName, subName) {
  const seg = findSegment(model, segName)
  if (!seg) return { seg: null, sub: null }
  const q = norm(subName)
  const sub = seg.subsegments.find(s => norm(s.name) === q) || seg.subsegments.find(s => norm(s.name).includes(q)) || null
  return { seg, sub }
}
function subById(model, subId) {
  for (const seg of model.segments) { const sub = seg.subsegments.find(s => s.id === subId); if (sub) return { seg, sub } }
  return { seg: null, sub: null }
}
function viewPost(model, p) {
  const { seg, sub } = subById(model, p.subId)
  return { id: p.id, title: p.title, date: p.date, status: STATUS_LABEL[p.status || 'draft'], type: p.type === 'repartage' ? 'repartage' : 'post', segment: seg ? seg.name : null, thematique: sub ? sub.name : null }
}

// ---- server ----
const server = new McpServer({ name: 'lyriks-calendar', version: '1.0.0' }, {
  instructions: "Gère les publications de la Grille éditoriale Lyriks (Brand Hub). Une publication = un post sur une thématique (sous-segment) d'un segment (preneur de parole : Page LYRIKS, David Mabboux, Adrien Charles, Adrien Basso, Newsletter). Statuts : DRAFT, VALIDATED, PUBLISHED. Les modifications sont partagées avec le calendrier web. Résous segments/thématiques par nom (approximatif accepté).",
})

const ok = (text, data) => ({ content: [{ type: 'text', text }], structuredContent: data })

server.registerTool('get_calendar', {
  title: 'Vue du calendrier',
  description: "Retourne la structure du calendrier éditorial : segments (preneurs de parole), leurs thématiques, et le nombre de publications. À appeler en premier pour connaître les noms disponibles.",
  inputSchema: {},
  annotations: { readOnlyHint: true, openWorldHint: true },
}, async () => {
  const m = await ensureModel()
  const segs = m.segments.map(s => ({ segment: s.name, note: s.note || '', thematiques: s.subsegments.map(x => x.name) }))
  const counts = { DRAFT: 0, VALIDATED: 0, PUBLISHED: 0 }
  m.posts.forEach(p => { counts[STATUS_LABEL[p.status || 'draft']]++ })
  return ok(`${m.segments.length} segments, ${m.posts.length} publications (DRAFT ${counts.DRAFT} · VALIDATED ${counts.VALIDATED} · PUBLISHED ${counts.PUBLISHED}).`, { segments: segs, totals: counts })
})

server.registerTool('list_publications', {
  title: 'Lister les publications',
  description: "Liste les publications, avec filtres optionnels. Dates au format AAAA-MM-JJ.",
  inputSchema: {
    segment: z.string().optional().describe('Filtrer par segment (preneur de parole)'),
    thematique: z.string().optional().describe('Filtrer par thématique'),
    status: z.enum(['DRAFT', 'VALIDATED', 'PUBLISHED']).optional().describe('Filtrer par statut'),
    from: z.string().optional().describe('Date de début (AAAA-MM-JJ) inclusive'),
    to: z.string().optional().describe('Date de fin (AAAA-MM-JJ) inclusive'),
  },
  annotations: { readOnlyHint: true, openWorldHint: true },
}, async ({ segment, thematique, status, from, to }) => {
  const m = await ensureModel()
  let posts = m.posts.map(p => viewPost(m, p))
  if (segment) posts = posts.filter(p => norm(p.segment).includes(norm(segment)))
  if (thematique) posts = posts.filter(p => norm(p.thematique).includes(norm(thematique)))
  if (status) posts = posts.filter(p => p.status === status)
  if (from) posts = posts.filter(p => p.date >= from)
  if (to) posts = posts.filter(p => p.date <= to)
  posts.sort((a, b) => a.date.localeCompare(b.date))
  return ok(`${posts.length} publication(s).`, { publications: posts })
})

server.registerTool('add_publication', {
  title: 'Ajouter une publication',
  description: "Crée une publication (post) sur une thématique d'un segment, à une date. Le segment et la thématique sont résolus par nom ; s'ils n'existent pas, ils sont créés.",
  inputSchema: {
    segment: z.string().describe('Segment / preneur de parole (ex. "David Mabboux", "Page LYRIKS")'),
    thematique: z.string().describe('Thématique (sous-segment). Créée si absente.'),
    title: z.string().describe('Titre de la publication'),
    date: z.string().describe('Date AAAA-MM-JJ'),
    status: z.enum(['DRAFT', 'VALIDATED', 'PUBLISHED']).optional().describe('Statut (défaut DRAFT)'),
    type: z.enum(['post', 'repartage']).optional().describe('Type (défaut post)'),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
}, async ({ segment, thematique, title, date, status, type }) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Date invalide, format attendu AAAA-MM-JJ.')
  const m = await ensureModel()
  let seg = findSegment(m, segment)
  if (!seg) { seg = { id: uid(), name: segment, note: '', subsegments: [] }; m.segments.push(seg) }
  let sub = seg.subsegments.find(s => norm(s.name) === norm(thematique)) || seg.subsegments.find(s => norm(s.name).includes(norm(thematique)))
  if (!sub) { sub = { id: uid(), name: thematique, color: PALETTE[seg.subsegments.length % PALETTE.length] }; seg.subsegments.push(sub) }
  const post = { id: uid(), subId: sub.id, date, title, type: type === 'repartage' ? 'repartage' : 'post', status: normStatus(status) }
  m.posts.push(post)
  const res = await saveModel(m)
  return ok(`Ajouté : "${title}" — ${seg.name} / ${sub.name} — ${date} — ${STATUS_LABEL[post.status]}.${res.offline ? ' (⚠ sauvegarde cloud indisponible)' : ''}`, viewPost(m, post))
})

server.registerTool('update_publication', {
  title: 'Modifier une publication',
  description: "Modifie une publication existante (par id). Seuls les champs fournis changent. Fournir segment+thematique pour la déplacer.",
  inputSchema: {
    id: z.string().describe('Identifiant de la publication (voir list_publications)'),
    title: z.string().optional(),
    date: z.string().optional().describe('AAAA-MM-JJ'),
    status: z.enum(['DRAFT', 'VALIDATED', 'PUBLISHED']).optional(),
    type: z.enum(['post', 'repartage']).optional(),
    segment: z.string().optional().describe('Déplacer vers ce segment'),
    thematique: z.string().optional().describe('Déplacer vers cette thématique'),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
}, async ({ id, title, date, status, type, segment, thematique }) => {
  const m = await ensureModel()
  const p = m.posts.find(x => x.id === id)
  if (!p) throw new Error(`Publication introuvable (id ${id}). Utilise list_publications pour retrouver l'id.`)
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Date invalide (AAAA-MM-JJ).')
  if (title != null) p.title = title
  if (date) p.date = date
  if (status) p.status = normStatus(status)
  if (type) p.type = type
  if (segment || thematique) {
    const cur = subById(m, p.subId)
    const segName = segment || (cur.seg ? cur.seg.name : '')
    const subName = thematique || (cur.sub ? cur.sub.name : '')
    let seg = findSegment(m, segName); if (!seg) { seg = { id: uid(), name: segName, note: '', subsegments: [] }; m.segments.push(seg) }
    let sub = seg.subsegments.find(s => norm(s.name) === norm(subName)) || seg.subsegments.find(s => norm(s.name).includes(norm(subName)))
    if (!sub) { sub = { id: uid(), name: subName, color: PALETTE[seg.subsegments.length % PALETTE.length] }; seg.subsegments.push(sub) }
    p.subId = sub.id
  }
  const res = await saveModel(m)
  return ok(`Modifié.${res.offline ? ' (⚠ cloud indisponible)' : ''}`, viewPost(m, p))
})

server.registerTool('delete_publication', {
  title: 'Supprimer une publication',
  description: 'Supprime définitivement une publication par id.',
  inputSchema: { id: z.string().describe('Identifiant de la publication') },
  annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
}, async ({ id }) => {
  const m = await ensureModel()
  const before = m.posts.length
  const removed = m.posts.find(x => x.id === id)
  m.posts = m.posts.filter(x => x.id !== id)
  if (m.posts.length === before) throw new Error(`Aucune publication avec l'id ${id}.`)
  const res = await saveModel(m)
  return ok(`Supprimé : "${removed.title}".${res.offline ? ' (⚠ cloud indisponible)' : ''}`, { deleted: id })
})

server.registerTool('list_segments', {
  title: 'Lister segments & thématiques',
  description: 'Retourne les segments et thématiques avec leurs identifiants (utile pour référencer précisément).',
  inputSchema: {},
  annotations: { readOnlyHint: true, openWorldHint: true },
}, async () => {
  const m = await ensureModel()
  return ok(`${m.segments.length} segments.`, { segments: m.segments.map(s => ({ id: s.id, name: s.name, note: s.note || '', thematiques: s.subsegments.map(x => ({ id: x.id, name: x.name, color: x.color })) })) })
})

server.registerTool('add_segment', {
  title: 'Ajouter un segment',
  description: 'Crée un nouveau segment (preneur de parole).',
  inputSchema: { name: z.string().describe('Nom du segment'), note: z.string().optional().describe('Note (cadence, rôle)') },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
}, async ({ name, note }) => {
  const m = await ensureModel()
  if (findSegment(m, name)) throw new Error(`Un segment "${name}" existe déjà.`)
  const seg = { id: uid(), name, note: note || '', subsegments: [] }
  m.segments.push(seg)
  const res = await saveModel(m)
  return ok(`Segment "${name}" créé.${res.offline ? ' (⚠ cloud indisponible)' : ''}`, { id: seg.id, name })
})

server.registerTool('add_thematique', {
  title: 'Ajouter une thématique',
  description: "Ajoute une thématique (sous-segment) à un segment.",
  inputSchema: { segment: z.string().describe('Segment cible'), name: z.string().describe('Nom de la thématique'), color: z.string().optional().describe('Couleur hex #RRGGBB') },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
}, async ({ segment, name, color }) => {
  const m = await ensureModel()
  let seg = findSegment(m, segment)
  if (!seg) { seg = { id: uid(), name: segment, note: '', subsegments: [] }; m.segments.push(seg) }
  if (seg.subsegments.some(s => norm(s.name) === norm(name))) throw new Error(`La thématique "${name}" existe déjà dans ${seg.name}.`)
  const sub = { id: uid(), name, color: /^#[0-9a-fA-F]{6}$/.test(color || '') ? color : PALETTE[seg.subsegments.length % PALETTE.length] }
  seg.subsegments.push(sub)
  const res = await saveModel(m)
  return ok(`Thématique "${name}" ajoutée à ${seg.name}.${res.offline ? ' (⚠ cloud indisponible)' : ''}`, { id: sub.id, segment: seg.name, name, color: sub.color })
})

const transport = new StdioServerTransport()
await server.connect(transport)
