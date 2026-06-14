/* ============================================================
   LYRIKS · STUDIO — COMPOSEUR (moteur)
   ============================================================ */
(function () {
  const S = window.STUDIO;
  const $ = (s, r = document) => r.querySelector(s);
  const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  const TRACKS = ['#FFA101', '#BB46F5', '#0066FF'];

  // ---- state ----
  const state = { type: null, typeFormats: null, format: 'portrait', background: 'ink', logo: 'lyriks-fonce', voice: 1, on: {}, values: {} };
  S.BLOCKS.forEach(b => { state.on[b.key] = ['title', 'text', 'stand', 'lanes'].includes(b.key); state.values[b.key] = b.def; });

  /* ---------- LEFT: structure steps ---------- */
  function buildStructure() {
    const nav = $('#supportNav'); nav.innerHTML = '';

    // MODÈLES (presets)
    nav.appendChild(el('div', 'nav-group', '0 · Modèles'));
    const pg = el('div', 'opt-grid');
    S.PRESETS.forEach(p => {
      const b = el('button', 'opt preset', `<span class="opt-lbl">${p.name}</span>`);
      b.onclick = () => applyPreset(p);
      pg.appendChild(b);
    });
    nav.appendChild(pg);

    // FORMAT
    nav.appendChild(el('div', 'nav-group', '1 · Format'));
    const fg = el('div', 'opt-grid');
    S.FORMATS.filter(f => !state.typeFormats || state.typeFormats.includes(f.id)).forEach(f => {
      const b = el('button', 'opt fmt' + (state.format === f.id ? ' on' : ''),
        `<span class="opt-ico"><span class="fmtbox" style="aspect-ratio:${f.w}/${f.h}"></span></span><span class="opt-lbl">${f.name}<small>${f.fmt}</small></span>`);
      b.onclick = () => { state.format = f.id; buildStructure(); renderPreview(); };
      fg.appendChild(b);
    });
    nav.appendChild(fg);

    // FOND
    nav.appendChild(el('div', 'nav-group', '2 · Fond'));
    const bgg = el('div', 'opt-grid');
    S.BACKGROUNDS.forEach(bk => {
      const b = el('button', 'opt bg' + (state.background === bk.id ? ' on' : ''),
        `<span class="bg-sw" style="background:${bk.css}"></span><span class="opt-lbl">${bk.name}</span>`);
      b.onclick = () => { state.background = bk.id; autoLogo(); buildStructure(); renderPreview(); };
      bgg.appendChild(b);
    });
    nav.appendChild(bgg);

    // LOGO
    nav.appendChild(el('div', 'nav-group', '3 · Logo'));
    const lg = el('div', 'opt-list');
    S.LOGOS.forEach(l => {
      const b = el('button', 'opt-row' + (state.logo === l.id ? ' on' : ''), `<span class="dotradio"></span>${l.name}`);
      b.onclick = () => { state.logo = l.id; buildStructure(); renderPreview(); };
      lg.appendChild(b);
    });
    nav.appendChild(lg);

    // VOIX (accent)
    nav.appendChild(el('div', 'nav-group', '4 · Voix / accent'));
    const vg = el('div', 'opt-list');
    S.VOICES.forEach(v => {
      const b = el('button', 'opt-row' + (state.voice === v.id ? ' on' : ''), `<span class="vdot" style="background:${v.color}"></span>${v.name}`);
      b.onclick = () => { state.voice = v.id; buildStructure(); renderPreview(); updateCopy(); };
      vg.appendChild(b);
    });
    nav.appendChild(vg);
  }

  // pick logo light/dark variant to match background when relevant
  function autoLogo() {
    const bg = S.BACKGROUNDS.find(b => b.id === state.background);
    if (!bg) return;
    if (state.logo === 'lyriks-clair' || state.logo === 'lyriks-fonce') {
      state.logo = bg.fg === 'light' ? 'lyriks-clair' : 'lyriks-fonce';
    }
  }

  /* ---------- entry gate ---------- */
  const GATE_COLORS = { post: '#0066FF', story: '#BB46F5', banniere: '#FFA101', newsletter: '#1FA98A', emailing: '#FA5FB2', communique: '#0A0A0A', libre: '#8047F4' };
  function buildGate() {
    const g = $('#gateGrid'); if (!g) return; g.innerHTML = '';
    S.SUPPORT_TYPES.forEach(t => {
      const c = GATE_COLORS[t.id] || '#FFA101';
      const card = el('button', 'gate-card',
        `<span class="gc-ic" style="background:${c}22"><span style="display:grid;gap:3px"><i style="display:block;width:14px;height:4px;border-radius:1px;background:#0066FF"></i><i style="display:block;width:14px;height:4px;border-radius:1px;background:#BB46F5"></i><i style="display:block;width:20px;height:4px;border-radius:1px;background:#FFA101"></i></span></span><b>${t.name}</b><small>${t.sub}</small>`);
      card.onclick = () => chooseType(t);
      g.appendChild(card);
    });
  }
  function chooseType(t) {
    state.type = t.id;
    state.typeFormats = t.formats || null;
    const p = S.PRESETS.find(x => x.id === t.preset);
    if (p) applyPreset(p); else { buildStructure(); buildForm(); renderPreview(); updateCopy(); }
    $('#typeGate').classList.add('hidden');
  }
  function openGate() { $('#typeGate').classList.remove('hidden'); }

  /* ---------- apply preset ---------- */
  function applyPreset(p) {
    state.format = p.format; state.background = p.background; state.logo = p.logo; state.voice = p.voice || 1;
    state.on = {}; state.values = {};
    S.BLOCKS.forEach(b => { state.on[b.key] = !!(p.on && p.on[b.key]); state.values[b.key] = (p.values && p.values[b.key] != null) ? p.values[b.key] : b.def; });
    buildStructure(); buildForm(); renderPreview(); updateCopy();
  }

  /* ---------- RIGHT: content blocks ---------- */
  function buildForm() {
    const form = $('#form'); form.innerHTML = '';
    S.BLOCKS.forEach(blk => {
      const wrap = el('div', 'blk');
      const head = el('div', 'blk-head');
      const sw = el('button', 'toggle' + (state.on[blk.key] ? ' on' : ''), '<span class="knob"></span>');
      sw.onclick = () => { state.on[blk.key] = !state.on[blk.key]; buildForm(); renderPreview(); updateCopy(); };
      head.appendChild(el('span', 'blk-name', blk.label));
      head.appendChild(sw);
      wrap.appendChild(head);
      if (state.on[blk.key] && blk.key !== 'photo' && blk.key !== 'lanes') {
        const multi = blk.key === 'title' || blk.key === 'text';
        const inp = el(multi ? 'textarea' : 'input', 'finput');
        if (multi) inp.rows = blk.key === 'text' ? 3 : 2; else inp.type = 'text';
        inp.value = state.values[blk.key] || '';
        inp.oninput = () => { state.values[blk.key] = inp.value; renderPreview(); updateCopy(); };
        wrap.appendChild(inp);
      }
      if (state.on[blk.key] && blk.key === 'photo') {
        const pg = el('div', 'opt-list', '');
        S.PHOTOS.forEach(p => {
          const b = el('button', 'opt-row' + ((state.values.photo || 'david') === p.id ? ' on' : ''), `<img src="${p.src}" alt="${p.name}" style="width:24px;height:24px;border-radius:50%;object-fit:cover;flex:none">${p.name}`);
          b.onclick = () => { state.values.photo = p.id; buildForm(); renderPreview(); };
          pg.appendChild(b);
        });
        pg.style.marginTop = '10px';
        wrap.appendChild(pg);
      }
      form.appendChild(wrap);
    });
  }

  /* ---------- convergence motif ---------- */
  function fillConvergence(host) {
    const W = host.clientWidth || 600, H = host.clientHeight || 300, playX = 0.56 * W;
    const ty = [0.26, 0.5, 0.74].map(t => t * H);
    let h = `<div style="position:absolute;top:0;bottom:0;width:3px;left:${playX}px;background:#FA5FB2"></div>`;
    ty.forEach((y, ti) => { let x = playX + 14; while (x < W - 26) { const w = 30 + Math.round(Math.random() * 60); if (x + w > W - 10) break; h += `<div style="position:absolute;height:14px;border-radius:4px;left:${x}px;top:${y - 7}px;width:${w}px;background:${TRACKS[ti]};opacity:${0.8 + Math.random() * 0.2}"></div>`; x += w + 12; } });
    const rows = Math.max(4, Math.round(H / 46));
    for (let r = 0; r < rows; r++) { const y = (0.1 + 0.8 * r / (rows - 1)) * H; let x = 8; while (x < playX - 30) { if (Math.random() < 0.34) { x += 30; continue; } const w = 22 + Math.round(Math.random() * 44); if (x + w > playX - 14) break; h += `<div style="position:absolute;height:12px;border-radius:4px;left:${x}px;top:${y - 6}px;width:${w}px;background:#2a2a32;opacity:.6"></div>`; x += w + 16; } }
    host.innerHTML = h;
  }

  /* ---------- preview ---------- */
  function curFmt() { return S.FORMATS.find(f => f.id === state.format) || S.FORMATS[0]; }
  function renderPreview() {
    const f = curFmt(), box = $('#stageBox');
    const availW = box.clientWidth - 128, availH = box.clientHeight - 128;
    const scale = Math.min(availW / f.w, availH / f.h, 1);
    const wrap = $('#artWrap'), art = $('#art');
    wrap.style.width = (f.w * scale) + 'px'; wrap.style.height = (f.h * scale) + 'px';
    art.style.width = f.w + 'px'; art.style.height = f.h + 'px'; art.style.transform = `scale(${scale})`;
    art.innerHTML = S.render(state);
    const conv = art.querySelector('[data-conv]'); if (conv) fillConvergence(conv);
    $('#dimLabel').textContent = `${f.name} · ${f.w} × ${f.h}`;
  }

  /* ---------- copy ---------- */
  function updateCopy() { $('#copyText').textContent = S.copyText(state); }

  /* ---------- exports ---------- */
  function exportPNG() {
    const f = curFmt(), art = $('#art');
    const btn = $('#btnPng'), old = btn.textContent; btn.textContent = 'Rendu…';
    const prev = art.style.transform; art.style.transform = 'none';
    const done = () => { art.style.transform = prev; btn.textContent = old; };
    const lib = window.htmlToImage;
    if (!lib) { done(); alert('Export PNG indisponible (librairie non chargée).'); return; }
    lib.toPng(art, { width: f.w, height: f.h, pixelRatio: 2, cacheBust: true })
      .then(url => { const a = document.createElement('a'); a.download = `lyriks-${state.format}.png`; a.href = url; a.click(); done(); })
      .catch(e => { done(); alert('Export PNG : ' + e.message); });
  }

  /* ---------- KB ---------- */
  function buildKB() {
    const body = $('#kbBody'); if (!body || body.dataset.built) return; body.dataset.built = '1';
    let h = '<div class="kb-h">Les 3 voix</div><div class="kb-grid">';
    S.VOICES.forEach(v => { h += `<div class="kb-card"><span class="kb-bar" style="background:${v.color}"></span><b>${v.who}</b><p>${v.track}</p></div>`; });
    h += '</div><div class="kb-h">Couleurs officielles</div><div class="kb-sw">';
    [['Bleu · Produit', '#0066FF'], ['Violet · Cohérence', '#BB46F5'], ['Orange · Business', '#FFA101'], ['Magenta · playhead', '#FA5FB2'], ['Encre', '#0A0A0A'], ['Clair', '#FAFAFC']].forEach(c => { h += `<div class="kb-swatch"><span class="kb-chip" style="background:${c[1]}"></span><span><b>${c[0]}</b><code>${c[1]}</code></span></div>`; });
    h += '</div><div class="kb-h">Règles d\u2019or</div><ul class="kb-rules"><li>Logo : 3 barres, écarts égaux, jamais recoloré.</li><li>Pistes : même hauteur, largeurs variables.</li><li>Toujours le stand : Pavillon 7 · Booth 1E24-001.</li><li>Polices : Space Grotesk · Montserrat · JetBrains Mono.</li></ul>';
    body.innerHTML = h;
  }

  /* ---------- tabs ---------- */
  document.querySelectorAll('.tab').forEach(t => t.onclick = () => {
    document.querySelectorAll('.tab').forEach(x => x.classList.remove('on')); t.classList.add('on');
    const kb = t.dataset.tab === 'kb';
    $('#viewStudio').style.display = kb ? 'none' : 'grid';
    $('#viewKB').style.display = kb ? 'block' : 'none';
    if (kb) buildKB();
  });

  $('#btnCopy').onclick = () => { navigator.clipboard.writeText(S.copyText(state)); const b = $('#btnCopy'); const o = b.textContent; b.textContent = 'Copié ✓'; b.classList.add('done'); setTimeout(() => { b.textContent = o; b.classList.remove('done'); }, 1400); };
  $('#btnPrint').onclick = () => window.print();
  $('#btnPng').onclick = exportPNG;

  // headings
  const fp = document.querySelector('.formpanel h2'); if (fp) fp.textContent = 'Blocs de contenu';
  const sub = document.querySelector('.formpanel .subtitle'); if (sub) sub.textContent = 'Activez les blocs et éditez les textes.';

  $('#btnType').onclick = openGate;

  // boot
  buildGate();
  buildStructure(); buildForm(); renderPreview(); updateCopy();
  window.addEventListener('resize', renderPreview);
})();
