// Navigation model for the Brand Hub.
// Reproduces the EXACT `PAGES` list from the reference site.html (verbatim
// labels / icons / colors). `f` = unique key / route id. `src` = real file
// served from /reference if it differs from `f`. `home` is the dashboard.
//
// The design handoff shipped only 6 reference HTML files; every entry whose
// HTML is NOT in the package is flagged `soon` and renders a "bientôt" stub
// instead of an empty iframe.

export type PageItem = {
  f: string
  t: string
  s: string
  ic: string
  c: string
  /** Reference HTML file under /reference (defaults to `f` when omitted). */
  src?: string
  /** True when the reference page wasn't shipped — renders a "bientôt" stub. */
  soon?: boolean
}

export type PageGroup = { g: string; items: PageItem[] }

export const PAGES: PageGroup[] = [
  {
    g: 'Accueil',
    items: [
      { f: 'home', t: 'Tableau de bord', s: 'Toutes les pages', ic: '⊞', c: '#FFA101' },
      { f: 'index.html', t: 'Sommaire du kit', s: "Vue d'ensemble", ic: '⌂', c: '#FFA101', soon: true },
    ],
  },
  {
    g: 'Chartes',
    items: [
      { f: 'charte.html', t: 'Charte générale', s: 'Univers de marque Lyriks', ic: '◆', c: '#BB46F5' },
      { f: 'charte-vivatech.html', t: 'Charte VivaTech', s: 'Co-branding événement', ic: '★', c: '#FFA101' },
    ],
  },
  {
    g: 'Bibliothèque',
    items: [
      { f: 'templates.html', t: 'Supports Lyriks', s: 'Gabarits classiques (marque)', ic: '▣', c: '#BB46F5' },
      { f: 'formats.html', t: 'Formats & exports', s: 'Tous les formats', ic: '❑', c: '#1FA98A', soon: true },
      { f: 'posts.html', t: 'Posts (1ʳᵉ version)', s: 'Studio de posts initial', ic: '▥', c: '#9097A2', soon: true },
      { f: 'templates-vivatech.html', t: 'Supports VivaTech', s: 'Posts, bannières, emails', ic: '▦', c: '#FFA101' },
      { f: 'posts-equipe-vivatech.html', t: "Posts d'annonce · VivaTech", s: 'Page + 3 membres', ic: '☺', c: '#0066FF', soon: true },
      { f: 'post-visage-vivatech.html', t: 'Post visage · VivaTech', s: '4 versions, photo', ic: '◉', c: '#BB46F5', soon: true },
    ],
  },
  {
    g: 'Éditorial',
    items: [
      { f: 'calendrier.html', t: 'Calendrier éditorial', s: '26 prises de parole', ic: '▤', c: '#1FA98A' },
    ],
  },
  {
    g: 'Kit de stand',
    items: [
      { f: 'stand-briefing.html', t: 'Manuel de stand', s: 'Aborder, qualifier, closer', ic: '☰', c: '#FFA101' },
      { f: 'stand-faq-produit.html', t: 'FAQ Produit', s: 'Produit & usage', ic: '◐', c: '#0066FF' },
      { f: 'stand-faq-business.html', t: 'FAQ Business', s: 'Business & questions piège · interne', ic: '◑', c: '#1FA98A' },
    ],
  },
  {
    g: 'Outils',
    items: [
      { f: 'studio.html', t: 'Studio de création', s: 'Composeur de supports', ic: '✦', c: '#FFA101' },
      { f: 'guide-reproduction.html', t: 'Guide de reproduction', s: 'Specs · 20 slides', ic: '❖', c: '#BB46F5', soon: true },
      { f: 'contexte-projet.html', t: 'Note de contexte', s: "À partager à l'équipe", ic: '◷', c: '#0066FF', soon: true },
    ],
  },
  {
    g: 'Labo & archives',
    items: [
      { f: 'labo.html', t: 'Labo', s: 'Explorations', ic: '⚗', c: '#9097A2', soon: true },
      { f: 'labo-fonds.html', t: 'Labo · fonds', s: 'Textures de fond', ic: '▒', c: '#9097A2', soon: true },
      { f: 'labo-posts.html', t: 'Labo · posts', s: 'Essais de posts', ic: '▢', c: '#9097A2', soon: true },
      { f: 'labo-posts-2.html', t: 'Labo · posts 2', s: 'Essais de posts', ic: '▢', c: '#9097A2', soon: true },
      { f: 'labo-carrousel.html', t: 'Labo · carrousel', s: 'Format carrousel', ic: '▭', c: '#9097A2', soon: true },
      { f: 'moodboards.html', t: 'Moodboards', s: 'Références visuelles', ic: '◫', c: '#9097A2', soon: true },
    ],
  },
]

export const FLAT_WITH_GROUP: (PageItem & { g: string })[] = PAGES.flatMap((g) =>
  g.items.map((i) => ({ ...i, g: g.g })),
)

export function findPage(f: string): (PageItem & { g: string }) | undefined {
  return FLAT_WITH_GROUP.find((p) => p.f === f)
}
