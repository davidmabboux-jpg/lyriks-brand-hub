/* ============================================================
   Édition en place des pages Stand & FAQ.
   Toute personne connectée (login d'équipe) peut modifier le texte ;
   sauvegarde automatique vers /api/doc ; copie horodatée à chaque pause.
   Le contenu éditable = le <main> de la page. La barre de navigation
   inter-pages (hors <main>) reste intacte.
   ============================================================ */
(function () {
  var script = document.currentScript
  var DOC_ID = script && script.dataset ? script.dataset.doc : null
  var main = document.querySelector('main')
  if (!DOC_ID || !main) return

  // ---- pastille d'état (masquée par défaut, visible seulement pendant une
  //      sauvegarde, puis disparaît). Aucun signal « mode édition ». ----
  var bar = document.createElement('div')
  bar.setAttribute('contenteditable', 'false')
  bar.style.cssText =
    'position:fixed;z-index:99999;right:16px;bottom:16px;display:flex;align-items:center;gap:8px;' +
    'font:600 12px/1.2 -apple-system,Segoe UI,Roboto,sans-serif;color:#1a1b20;background:#fff;' +
    'border:1px solid #e6e8ee;border-radius:999px;padding:8px 14px;box-shadow:0 8px 24px -12px rgba(16,18,40,.35);' +
    'opacity:0;pointer-events:none;transition:opacity .25s'
  var dot = document.createElement('span')
  dot.style.cssText = 'width:8px;height:8px;border-radius:50%;background:#1FA98A;flex:none'
  var label = document.createElement('span')
  bar.appendChild(dot)
  bar.appendChild(label)
  document.body.appendChild(bar)

  var hideTimer = null
  function status(text, color, autohide) {
    label.textContent = text
    dot.style.background = color || '#1FA98A'
    bar.style.opacity = '1'
    clearTimeout(hideTimer)
    if (autohide) hideTimer = setTimeout(function () { bar.style.opacity = '0' }, 2000)
  }

  // ---- chargement du contenu sauvegardé (sinon : contenu d'origine) ----
  fetch('/api/doc?id=' + encodeURIComponent(DOC_ID), { headers: { accept: 'application/json' } })
    .then(function (r) { return r.ok ? r.json() : null })
    .then(function (d) {
      if (d && typeof d.content === 'string' && d.content.trim()) {
        main.innerHTML = d.content
      }
    })
    .catch(function () { /* hors-ligne : on garde le contenu d'origine */ })
    .finally(enableEditing)

  var saveTimer = null
  var snapshotTimer = null

  function enableEditing() {
    main.setAttribute('contenteditable', 'true')
    main.setAttribute('spellcheck', 'true')
    main.style.outline = 'none'

    main.addEventListener('input', function () {
      status('Modification…', '#FFA101')
      clearTimeout(saveTimer)
      saveTimer = setTimeout(function () { save(false) }, 800)
      // une copie à date au plus une fois toutes les 2 min d'activité
      if (!snapshotTimer) {
        snapshotTimer = setTimeout(function () {
          snapshotTimer = null
          save(true)
        }, 120000)
      }
    })

    // copie à date dès qu'on quitte le champ (pause franche)
    main.addEventListener('blur', function () {
      clearTimeout(saveTimer)
      save(true)
    })

    // sauvegarde finale avant fermeture de l'onglet (best-effort)
    window.addEventListener('beforeunload', function () {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          '/api/doc',
          new Blob([JSON.stringify({ id: DOC_ID, content: main.innerHTML, snapshot: true })], {
            type: 'application/json',
          }),
        )
      }
    })
  }

  function save(snapshot) {
    status('Enregistrement…', '#FFA101')
    fetch('/api/doc', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: DOC_ID, content: main.innerHTML, snapshot: !!snapshot }),
    })
      .then(function (r) {
        if (!r.ok) throw new Error('save')
        status(snapshot ? 'Enregistré · copie gardée' : 'Enregistré', '#1FA98A', true)
      })
      .catch(function () { status('Hors-ligne · non enregistré', '#d63b3b') })
  }
})()
