import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Logo from './components/Logo'
import Rail from './components/Rail'
import CommandPalette from './components/CommandPalette'
import Dashboard from './components/Dashboard'
import { findPage } from './data/pages'

export default function App() {
  const navigate = useNavigate()
  const { pageId } = useParams()
  const current = pageId ?? 'home'
  const page = findPage(current) ?? findPage('home')!

  const [search, setSearch] = useState('')
  const [cmdkOpen, setCmdkOpen] = useState(false)
  const [navOpen, setNavOpen] = useState(false)

  const go = useCallback(
    (f: string) => {
      setNavOpen(false)
      try {
        localStorage.setItem('lyriks_hub_page', f)
      } catch {
        /* ignore */
      }
      navigate(f === 'home' ? '/' : `/p/${f}`)
    },
    [navigate],
  )

  // On first load at the root, restore the last visited page (like site.html).
  useEffect(() => {
    if (pageId) return
    let last: string | null = null
    try {
      last = localStorage.getItem('lyriks_hub_page')
    } catch {
      /* ignore */
    }
    if (last && last !== 'home' && findPage(last)) {
      navigate(`/p/${last}`, { replace: true })
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ⌘K / Ctrl+K toggles the palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCmdkOpen((o) => !o)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const isHome = page.f === 'home'

  return (
    <div className={`shell${navOpen ? ' navopen' : ''}`}>
      <header className="apphead">
        <div className="brandzone">
          <button className="menutoggle" onClick={() => setNavOpen((o) => !o)}>
            ☰
          </button>
          <Logo onDark />
          <span className="ev">Brand Hub</span>
        </div>
        <div className="hctx">
          <div className="crumb">{page.g}</div>
          <div className="title">{page.t}</div>
        </div>
        <input
          className="hsearch"
          type="search"
          placeholder="Rechercher une page…"
          autoComplete="off"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="kbd" title="Palette de commandes" onClick={() => setCmdkOpen(true)}>
          ⌘K
        </button>
      </header>

      <Rail filter={search} current={current} onPick={go} />
      {navOpen && <div className="scrim" onClick={() => setNavOpen(false)} />}

      <main className="main">
        <div className="frameWrap">
          {isHome ? (
            <Dashboard onPick={go} />
          ) : page.soon ? (
            <div className="stub">
              <div className="box">
                <div className="ico">{page.ic}</div>
                <h3>{page.t}</h3>
                <p>{page.s}. Cette page n'est pas encore branchée dans le Hub.</p>
                <span className="tag">Bientôt</span>
              </div>
            </div>
          ) : (
            <iframe
              key={page.f}
              title={page.t}
              src={`/reference/${page.src ?? page.f}`}
            />
          )}
        </div>
      </main>

      <CommandPalette open={cmdkOpen} onClose={() => setCmdkOpen(false)} onPick={go} />
    </div>
  )
}
