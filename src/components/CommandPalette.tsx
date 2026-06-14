import { useEffect, useRef, useState } from 'react'
import { FLAT_WITH_GROUP } from '../data/pages'

type Props = {
  open: boolean
  onClose: () => void
  onPick: (f: string) => void
}

export default function CommandPalette({ open, onClose, onPick }: Props) {
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const res = FLAT_WITH_GROUP.filter(
    (p) => !q.trim() || `${p.t} ${p.s} ${p.g}`.toLowerCase().includes(q.trim().toLowerCase()),
  )

  useEffect(() => {
    if (open) {
      setQ('')
      setSel(0)
      // focus after paint
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  useEffect(() => {
    setSel(0)
  }, [q])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSel((s) => Math.min(s + 1, res.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSel((s) => Math.max(s - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const hit = res[sel]
        if (hit) {
          onPick(hit.f)
          onClose()
        }
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, res, sel, onClose, onPick])

  useEffect(() => {
    listRef.current?.querySelector('.cmdk-item.sel')?.scrollIntoView({ block: 'nearest' })
  }, [sel])

  if (!open) return null

  let lastG: string | null = null

  return (
    <div className="cmdk" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cmdk-box">
        <input
          ref={inputRef}
          type="text"
          placeholder="Aller à… page, domaine, outil"
          autoComplete="off"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="cmdk-list" ref={listRef}>
          {res.length === 0 && <div className="cmdk-empty">Aucun résultat</div>}
          {res.map((p, i) => {
            const showGrp = p.g !== lastG
            lastG = p.g
            return (
              <div key={p.f}>
                {showGrp && <div className="cmdk-grp">{p.g}</div>}
                <div
                  className={`cmdk-item${i === sel ? ' sel' : ''}`}
                  onMouseEnter={() => setSel(i)}
                  onClick={() => {
                    onPick(p.f)
                    onClose()
                  }}
                >
                  <span className="ic" style={{ background: `${p.c}22`, color: p.c }}>
                    {p.ic}
                  </span>
                  <span className="t">
                    {p.t}
                    <small>{p.s}</small>
                  </span>
                  <span className="g">{p.g}</span>
                </div>
              </div>
            )
          })}
        </div>
        <div className="cmdk-foot">
          <span>↑↓ naviguer</span>
          <span>↵ ouvrir</span>
          <span>esc fermer</span>
        </div>
      </div>
    </div>
  )
}
