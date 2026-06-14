import { PAGES } from '../data/pages'

export default function Dashboard({ onPick }: { onPick: (f: string) => void }) {
  return (
    <div className="home">
      <div className="hero">
        <div className="eyebrow">Lyriks · Brand Hub</div>
        <h1>Tout le kit, au même endroit.</h1>
        <p>
          Chartes, supports, outils et archives , cliquez une carte pour ouvrir la page.
          Utilisez la recherche à gauche pour filtrer, ou ⌘K pour la palette de commandes.
        </p>
        <div className="barstack">
          <i style={{ width: 54, background: '#0066FF' }} />
          <i style={{ width: 38, background: '#BB46F5' }} />
          <i style={{ width: 72, background: '#FFA101' }} />
        </div>
      </div>
      <div className="dwrap">
        {PAGES.map((group) => {
          const items = group.items.filter((p) => p.f !== 'home')
          if (!items.length) return null
          return (
            <div key={group.g}>
              <div className="dgrp">{group.g}</div>
              <div className="dgrid">
                {items.map((p) => (
                  <button key={p.f} className="dcard" onClick={() => onPick(p.f)}>
                    {p.soon && <span className="soontag">bientôt</span>}
                    <span className="dic" style={{ background: `${p.c}22`, color: p.c }}>
                      {p.ic}
                    </span>
                    <b>{p.t}</b>
                    <small>{p.s}</small>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
