/* ============================================================
   LYRIKS · STUDIO — COMPOSEUR (données + rendu)
   Modèle compositionnel : Format × Fond × Logo × Blocs.
   window.STUDIO = { FORMATS, BACKGROUNDS, LOGOS, VOICES, BLOCKS, render, KB }
   ============================================================ */
(function () {
  const TRACKS = ['#FFA101', '#BB46F5', '#0066FF'];
  const PHOTOS = [
    { id: 'david', name: 'David', src: 'photos/david.jpg' },
    { id: 'adrien-bb', name: 'Adrien BB', src: 'photos/adrien-bb.jpg' },
    { id: 'adrien-charles', name: 'Adrien C', src: 'photos/adrien-charles.png' }
  ];
  const esc = s => (s == null ? '' : String(s)).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const nl = s => esc(s).replace(/\n/g, '<br>');

  /* ---------- FORMATS ---------- */
  const FORMATS = [
    { id: 'carre',     name: 'Post carré',      w: 1080, h: 1080, fmt: '1080 × 1080' },
    { id: 'portrait',  name: 'Post portrait',   w: 1080, h: 1350, fmt: '1080 × 1350' },
    { id: 'story',     name: 'Story',           w: 1080, h: 1920, fmt: '1080 × 1920' },
    { id: 'paysage',   name: 'Paysage',         w: 1920, h: 1080, fmt: '1920 × 1080' },
    { id: 'banniere',  name: 'Bannière',        w: 1584, h: 396,  fmt: '1584 × 396' },
    { id: 'a4',        name: 'A4 (doc)',        w: 794,  h: 1123, fmt: '794 × 1123' }
  ];

  /* ---------- FONDS ---------- */
  // fg: 'light' (texte sombre) | 'dark' (texte blanc). gen: fonction(accent)->html de couches.
  const BACKGROUNDS = [
    { id: 'ink',         name: 'Encre',            fg: 'dark',  css: '#0A0A0A' },
    { id: 'paper',       name: 'Clair',            fg: 'light', css: '#FAFAFC' },
    { id: 'signal',      name: 'Signal VivaTech',  fg: 'dark',  css: 'linear-gradient(105deg,#8047F4 0%,#BB46F5 38%,#FA5FB2 72%,#FFA101 130%)' },
    { id: 'brand',       name: 'Signal marque',    fg: 'dark',  css: 'linear-gradient(105deg,#8047F4 0%,#BB46F5 48%,#FA5FB2 100%)' },
    { id: 'ink-glow',    name: 'Encre + halo',     fg: 'dark',  css: '#0A0A0A', gen: (a) => `<div style="position:absolute;inset:0;background:radial-gradient(60% 46% at 82% 18%,${a}55,transparent 60%)"></div>` },
    { id: 'stripes',     name: 'Stripes 3 pistes', fg: 'dark',  css: '#0A0A0A', gen: () => stripes(0.16) },
    { id: 'bands',       name: 'Bandes pleines',   fg: 'dark',  css: '#0A0A0A', gen: () => bands() },
    { id: 'convergence', name: 'Convergence',      fg: 'dark',  css: '#0A0A0A', gen: () => `<div data-conv="1" style="position:absolute;left:0;right:0;bottom:0;top:46%"></div>` },
    { id: 'wave',        name: 'Wave · égaliseur',  fg: 'dark',  css: '#0A0A0A', gen: () => eqBars() },
    { id: 'colonnes',    name: 'Colonnes (bas)',    fg: 'dark',  css: '#0A0A0A', gen: () => columns() },
    { id: 'filigrane',   name: 'Filigrane + pistes',fg: 'dark',  css: 'linear-gradient(105deg,#8047F4 0%,#BB46F5 38%,#FA5FB2 72%,#FFA101 130%)', gen: () => filigrane() },
    { id: 'paper-edge',  name: 'Clair + filets',   fg: 'light', css: '#FAFAFC', gen: () => `<div style="position:absolute;left:0;right:0;top:0;height:1.4%;display:flex"><i style="flex:1;background:#FFA101"></i><i style="flex:1.6;background:#BB46F5"></i><i style="flex:.8;background:#0066FF"></i></div>` }
  ];
  function stripes(op) {
    let h = `<div style="position:absolute;inset:0;display:flex;opacity:${op}">`;
    for (let i = 0; i < 18; i++) h += `<div style="width:${100 / 18}%;background:${TRACKS[i % 3]}"></div>`;
    return h + '</div>';
  }
  function bands() {
    let h = '<div style="position:absolute;inset:0">';
    for (let i = 0; i < 12; i++) h += `<div style="height:${100 / 12}%;background:${TRACKS[i % 3]}"></div>`;
    return h + '</div>';
  }
  function eqBars() {
    const n = 44; let h = '<div style="position:absolute;left:0;right:0;bottom:0;height:34%;display:flex;align-items:flex-end;gap:6px;padding:0 6%">';
    for (let i = 0; i < n; i++) { const t = i / (n - 1); const hgt = 18 + 64 * Math.abs(Math.sin(t * Math.PI * 2.2)) + 10 * Math.sin(t * 9); const band = t < 0.4 ? TRACKS[0] : t < 0.72 ? TRACKS[1] : TRACKS[2]; h += `<span style="flex:1;height:${Math.min(hgt, 100)}%;background:${band};border-radius:5px 5px 0 0;opacity:.92"></span>`; }
    return h + '</div>';
  }
  function columns() {
    const n = 30; let h = '<div style="position:absolute;left:0;right:0;bottom:0;height:42%;display:flex;align-items:flex-end">';
    for (let i = 0; i < n; i++) { const v = Math.abs(Math.sin(i * 0.7) * 0.6 + Math.sin(i * 1.9) * 0.4); const hgt = 30 + 60 * v; h += `<span style="flex:1;height:${Math.min(hgt, 100)}%;background:${TRACKS[i % 3]}"></span>`; }
    return h + '</div>';
  }
  function filigrane() {
    return `<div style="position:absolute;inset:0;background:radial-gradient(60% 50% at 84% 12%,rgba(255,255,255,.16),transparent 60%)"></div>
      <div style="position:absolute;right:-2%;top:50%;transform:translateY(-50%);display:grid;gap:18px;opacity:.14">
        <b style="display:block;width:240px;height:34px;border-radius:8px;background:#fff"></b>
        <b style="display:block;width:240px;height:34px;border-radius:8px;background:#fff"></b>
        <b style="display:block;width:340px;height:34px;border-radius:8px;background:#fff"></b>
      </div>`;
  }

  /* ---------- LOGOS ---------- */
  const LOGOS = [
    { id: 'lyriks-clair', name: 'Lyriks · fond clair' },
    { id: 'lyriks-fonce', name: 'Lyriks · fond foncé' },
    { id: 'cobrand',      name: 'Lyriks × VivaTech' },
    { id: 'vivatech',     name: 'VivaTech seul' }
  ];
  function lkLogo(px, dark) {
    return `<span class="lk-logo${dark ? ' on-dark' : ''}" style="font-size:${px}px"><span class="lk-mark"><i></i><i></i><i></i></span><span class="lk-word">Lyriks.io</span></span>`;
  }
  function vtLogo(px, white) {
    return `<img src="${white ? 'vivatech-logo-white.svg' : 'vivatech-logo.svg'}" alt="VivaTech" style="height:${px}px;display:block;filter:drop-shadow(0 2px 8px rgba(0,0,0,.28))">`;
  }
  function logoHTML(choice, scale, fgDark) {
    const s = scale; // px base for lyriks wordmark
    if (choice === 'vivatech') return vtLogo(s * 1.7, fgDark);
    if (choice === 'cobrand') {
      const dark = choice === 'lyriks-fonce' ? true : fgDark;
      return `<span style="display:inline-flex;align-items:center;gap:${s * 0.55}px">${lkLogo(s, fgDark)}<span style="font-family:var(--display);font-weight:500;font-size:${s * 0.85}px;color:#FFA101">×</span>${vtLogo(s * 1.7, fgDark)}</span>`;
    }
    // lyriks-clair = dark wordmark; lyriks-fonce = white wordmark
    return lkLogo(s, choice === 'lyriks-fonce');
  }

  /* ---------- VOIX (accent) ---------- */
  const VOICES = [
    { id: 1, name: 'Business', who: 'David', color: '#FFA101', textOn: '#1A1A1A', track: 'TRACK 01 · BUSINESS' },
    { id: 2, name: 'Cohérence', who: 'Adrien Basso Blandin', color: '#BB46F5', textOn: '#FFFFFF', track: 'TRACK 02 · COHÉRENCE' },
    { id: 3, name: 'Produit', who: 'Adrien Charles', color: '#0066FF', textOn: '#FFFFFF', track: 'TRACK 03 · PRODUIT' }
  ];

  /* ---------- BLOCS ---------- */
  const BLOCKS = [
    { key: 'kicker', label: 'Accroche', def: '★ SAVE THE DATE' },
    { key: 'photo',  label: 'Photo (ronde)', def: 'david' },
    { key: 'title',  label: 'Titre', def: 'Lyriks sera\nà VivaTech.' },
    { key: 'text',   label: 'Texte', def: 'La couche de cohérence produit, en démo live sur notre stand.' },
    { key: 'lanes',  label: 'Filets de piste', def: '' },
    { key: 'cta',    label: 'Bouton (CTA)', def: 'Réservez votre démo →' },
    { key: 'stand',  label: 'Stand', def: '📍 Pavillon 7 · Booth 1E24-001  ·  📅 17–20 juin' }
  ];

  /* ---------- RENDER ---------- */
  function render(st) {
    const fmt = FORMATS.find(f => f.id === st.format) || FORMATS[0];
    const bg = BACKGROUNDS.find(b => b.id === st.background) || BACKGROUNDS[0];
    const v = VOICES.find(x => x.id === st.voice) || VOICES[0];
    const dark = bg.fg === 'dark';
    const fg = dark ? '#FFFFFF' : '#0A0A0A';
    const soft = dark ? '#cfcfd6' : '#535462';
    const accent = bg.id === 'signal' || bg.id === 'brand' ? '#FFFFFF' : v.color;
    const on = st.on || {};
    const val = st.values || {};

    // scale of inner type to the format (portrait/story bigger)
    const big = fmt.w >= 1500 || fmt.h >= 1600;
    const pad = fmt.id === 'banniere' ? '54px 72px' : (fmt.w <= 800 ? '64px' : '84px');
    const titleSize = fmt.id === 'banniere' ? 56 : (fmt.h >= 1600 ? 110 : (fmt.w >= 1500 ? 88 : 92));
    const logoPx = fmt.id === 'banniere' ? 34 : 32;

    let bgLayer = `<div style="position:absolute;inset:0;background:${bg.css}"></div>`;
    if (bg.gen) bgLayer += bg.gen(v.color);

    const blocks = [];
    // logo header
    blocks.push(`<div style="flex:none">${logoHTML(st.logo || 'lyriks-fonce', logoPx, dark)}</div>`);

    const body = [];
    if (on.kicker) body.push(`<div style="font-family:var(--mono);font-weight:700;font-size:${big ? 26 : 24}px;letter-spacing:.08em;color:${dark ? '#0a0a0a' : '#0a0a0a'};background:${bg.id === 'signal' || bg.id === 'brand' ? '#fff' : (dark ? '#fff' : v.color)};color:${bg.id === 'signal' || bg.id === 'brand' || dark ? '#0a0a0a' : v.textOn};display:inline-block;align-self:flex-start;padding:12px 22px;border-radius:999px">${esc(val.kicker)}</div>`);
    if (on.photo) { const ph = PHOTOS.find(p => p.id === val.photo) || PHOTOS[0]; body.push(`<img src="${ph.src}" alt="${ph.name}" style="width:300px;height:300px;border-radius:50%;object-fit:cover;box-shadow:inset 0 0 0 4px rgba(${dark ? '255,255,255' : '10,10,10'},.4),0 0 0 4px rgba(${dark ? '255,255,255' : '10,10,10'},.4)">`); }
    if (on.title) body.push(`<div style="font-family:var(--display);font-weight:700;letter-spacing:-.04em;line-height:.94;font-size:${titleSize}px;color:${fg}">${nl(val.title)}</div>`);
    if (on.text) body.push(`<p style="font-family:var(--font);font-weight:500;font-size:${big ? 34 : 32}px;line-height:1.4;color:${soft};margin:0;max-width:26ch">${nl(val.text)}</p>`);

    // footer cluster
    const footer = [];
    if (on.lanes) footer.push(`<div style="display:flex;gap:10px"><i style="height:16px;width:150px;border-radius:5px;background:#FFA101"></i><i style="height:16px;width:90px;border-radius:5px;background:#BB46F5"></i><i style="height:16px;width:120px;border-radius:5px;background:#0066FF"></i></div>`);
    const footRow = [];
    if (on.stand) footRow.push(`<span style="font-family:var(--mono);font-weight:700;font-size:${big ? 24 : 23}px;color:${fg}">${esc(val.stand)}</span>`);
    if (on.cta) footRow.push(`<span style="font-family:var(--display);font-weight:700;font-size:${big ? 30 : 27}px;letter-spacing:-.02em;color:${bg.id === 'signal' || bg.id === 'brand' ? '#0a0a0a' : v.textOn};background:${bg.id === 'signal' || bg.id === 'brand' ? '#fff' : v.color};padding:18px 26px;border-radius:16px">${esc(val.cta)}</span>`);
    if (footRow.length) footer.push(`<div style="display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap">${footRow.join('')}</div>`);

    return `${bgLayer}
      <div style="position:absolute;inset:0;padding:${pad};display:flex;flex-direction:column;gap:${big ? 30 : 26}px">
        ${blocks.join('')}
        <div style="display:flex;flex-direction:column;gap:${big ? 26 : 22}px;margin-top:6px">${body.join('')}</div>
        ${footer.length ? `<div style="margin-top:auto;display:flex;flex-direction:column;gap:${big ? 24 : 20}px">${footer.join('')}</div>` : ''}
      </div>`;
  }

  /* ---------- copy text (for the post body) ---------- */
  function copyText(st) {
    const val = st.values || {}, on = st.on || {};
    const lines = [];
    if (on.title) lines.push(String(val.title || '').replace(/\n/g, ' '));
    if (on.text) lines.push(val.text || '');
    if (on.stand) lines.push(val.stand || '');
    if (on.cta) lines.push('👉 ' + (val.cta || ''));
    lines.push('#VivaTech #IA');
    return lines.filter(Boolean).join('\n\n');
  }

  /* ---------- KB ---------- */
  const KB = { VOICES, TRACKS };

  /* ---------- MODÈLES (presets) ---------- */
  // Un modèle pré-règle format + fond + logo + voix + blocs actifs + textes.
  const PRESETS = [
    { id: 'save-date', name: 'Save the date', format: 'carre', background: 'signal', logo: 'cobrand', voice: 1,
      on: { kicker: 1, title: 1, text: 1, lanes: 1, cta: 1, stand: 1 },
      values: { kicker: '★ SAVE THE DATE', title: 'Lyriks sera\nà VivaTech.', text: 'La couche de cohérence produit, en démo live sur notre stand.', cta: 'Réservez votre démo →', stand: '📍 Pavillon 7 · Booth 1E24-001  ·  📅 17–20 juin' } },
    { id: 'annonce', name: 'Annonce page', format: 'portrait', background: 'signal', logo: 'cobrand', voice: 2,
      on: { title: 1, text: 1, lanes: 1, cta: 1, stand: 1 },
      values: { title: 'On sera\nà VivaTech.', text: 'Une seule vérité produit, synchronisée avec vos outils. Démo live sur le stand.', cta: 'Réserver un créneau →', stand: '📍 Pavillon 7 · Booth 1E24-001  ·  📅 17–20 juin' } },
    { id: 'countdown', name: 'Compte à rebours', format: 'portrait', background: 'ink-glow', logo: 'cobrand', voice: 1,
      on: { kicker: 1, title: 1, lanes: 1, stand: 1 },
      values: { kicker: 'J-14 · AVANT VIVATECH', title: 'Plus que\nquelques jours.', stand: '📍 Booth 1E24-001 · 17–20 juin' } },
    { id: 'visage', name: 'Post visage', format: 'portrait', background: 'ink', logo: 'cobrand', voice: 1,
      on: { photo: 1, kicker: 1, title: 1, text: 1, lanes: 1, cta: 1, stand: 1 },
      values: { photo: 'david', kicker: 'TRACK 01 · BUSINESS', title: 'Je serai\nà VivaTech.', text: 'On vient montrer comment la cohérence produit protège vos délais à l\u2019ère de l\u2019IA.', cta: 'On se voit là-bas →', stand: '📍 Booth 1E24-001 · 17–20 juin' } },
    { id: 'banniere', name: 'Bannière', format: 'banniere', background: 'signal', logo: 'cobrand', voice: 1,
      on: { title: 1, stand: 1 },
      values: { title: 'On vous attend au Booth 1E24-001.', stand: '📅 17–20 juin · Pavillon 7' } },
    { id: 'citation', name: 'Citation', format: 'carre', background: 'ink', logo: 'lyriks-fonce', voice: 2,
      on: { title: 1, stand: 0 },
      values: { title: '« La partition qui fait jouer\ntoute l\u2019équipe\nla même musique. »' } },
    { id: 'vierge', name: 'Vierge', format: 'portrait', background: 'ink', logo: 'lyriks-fonce', voice: 1,
      on: { title: 1 },
      values: { title: 'Votre titre ici.' } },
    { id: 'newsletter', name: 'Newsletter', format: 'a4', background: 'signal', logo: 'cobrand', voice: 2,
      on: { kicker: 1, title: 1, text: 1, cta: 1, stand: 1 },
      values: { kicker: 'NEWSLETTER · VIVATECH', title: 'On vous attend à VivaTech.', text: 'Une démo live de la couche de cohérence, sur notre stand. 15 minutes pour voir ce que ça change.', cta: 'Réserver un créneau →', stand: '📍 Pavillon 7 · Booth 1E24-001 · 17–20 juin' } },
    { id: 'communique', name: 'Communiqué', format: 'a4', background: 'paper', logo: 'cobrand', voice: 3,
      on: { kicker: 1, title: 1, text: 1, stand: 1 },
      values: { kicker: 'COMMUNIQUÉ DE PRESSE', title: 'Lyriks présente sa couche de cohérence à VivaTech 2026.', text: 'La startup dévoile une plateforme qui donne à chaque équipe une seule vérité produit, synchronisée avec ses outils.', stand: 'Contact presse · presse@lyriks.io · Booth 1E24-001' } },
    { id: 'emailing', name: 'Emailing', format: 'portrait', background: 'signal', logo: 'cobrand', voice: 1,
      on: { kicker: 1, title: 1, text: 1, cta: 1, stand: 1 },
      values: { kicker: 'J-3 · DERNIERS JOURS', title: 'Plus que 3 jours\navant VivaTech.', text: 'Réservez votre démo avant que les créneaux ne partent.', cta: 'Réserver ma démo →', stand: '📍 Booth 1E24-001 · 17–20 juin' } }
  ];

  /* ---------- TYPES DE SUPPORT (écran d'entrée) ---------- */
  const SUPPORT_TYPES = [
    { id: 'post',       name: 'Post LinkedIn',       sub: 'Carré ou portrait',     formats: ['carre', 'portrait'], preset: 'annonce' },
    { id: 'story',      name: 'Story',               sub: '1080 × 1920',           formats: ['story'],             preset: 'visage' },
    { id: 'banniere',   name: 'Bannière',            sub: 'En-tête LinkedIn',      formats: ['banniere'],          preset: 'banniere' },
    { id: 'newsletter', name: 'Newsletter',          sub: 'Email éditorial',       formats: ['a4', 'portrait'],    preset: 'newsletter' },
    { id: 'emailing',   name: 'Emailing',            sub: 'Relance promo',         formats: ['portrait', 'carre'], preset: 'emailing' },
    { id: 'communique', name: 'Communiqué de presse',sub: 'A4 · presse',           formats: ['a4'],                preset: 'communique' },
    { id: 'libre',      name: 'Création libre',      sub: 'Tous formats',          formats: ['carre','portrait','story','paysage','banniere','a4'], preset: 'vierge' }
  ];

  window.STUDIO = { FORMATS, BACKGROUNDS, LOGOS, VOICES, BLOCKS, PHOTOS, PRESETS, SUPPORT_TYPES, render, copyText, KB };
})();
