import { PAGES, type PageItem } from '../data/pages'

type Props = {
  filter: string
  current: string
  onPick: (f: string) => void
}

export default function Rail({ filter, current, onPick }: Props) {
  const q = filter.trim().toLowerCase()
  const groups = PAGES.map((group) => ({
    g: group.g,
    items: group.items.filter(
      (p) => !q || `${p.t} ${p.s} ${group.g}`.toLowerCase().includes(q),
    ),
  })).filter((group) => group.items.length > 0)

  return (
    <aside className="rail">
      <nav className="nav">
        {groups.length === 0 && <div className="empty">Aucune page</div>}
        {groups.map((group) => (
          <div key={group.g}>
            <div className="grp">
              {group.g} <span className="gcount">{group.items.length}</span>
            </div>
            {group.items.map((p: PageItem) => (
              <a
                key={p.f}
                className={p.f === current ? 'on' : ''}
                title={p.s}
                onClick={() => onPick(p.f)}
              >
                <span className="ic" style={{ background: `${p.c}22`, color: p.c }}>
                  {p.ic}
                </span>
                <span className="lbl">{p.t}</span>
                {p.soon && <span className="soontag">bientôt</span>}
              </a>
            ))}
          </div>
        ))}
      </nav>
      <div className="foot">
        VivaTech 2026
        <br />
        Pavillon 7 · Booth 1E24-001
      </div>
    </aside>
  )
}
