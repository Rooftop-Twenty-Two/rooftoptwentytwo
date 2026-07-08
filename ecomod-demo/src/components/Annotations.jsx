import React, { createContext, useContext, useEffect, useState } from 'react'

// Numbered coral annotation pins plus a collapsible side panel.
// Each page registers its annotations; pins in the page open the panel.
// These double as talking points in the pitch meeting.

const Ctx = createContext(null)

export function AnnotationProvider({ children }) {
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  return (
    <Ctx.Provider value={{ setItems, setOpen }}>
      {children}
      {items.length > 0 && !open && (
        <button className="annotations-toggle" onClick={() => setOpen(true)}>
          Annotations ({items.length})
        </button>
      )}
      {items.length > 0 && open && (
        <aside className="annotations-panel">
          <div className="spread">
            <h3>Annotations</h3>
            <button className="btn-small" onClick={() => setOpen(false)}>Close</button>
          </div>
          <p className="small muted">What each numbered element does in the production build.</p>
          {items.map((item, i) => (
            <div className="anno" key={i}>
              <span className="pin">{i + 1}</span>
              <p><strong>{item.title}</strong>{item.body}</p>
            </div>
          ))}
        </aside>
      )}
    </Ctx.Provider>
  )
}

// Declare the current page's annotation list. Renders nothing itself.
export function PageAnnotations({ items }) {
  const ctx = useContext(Ctx)
  useEffect(() => {
    ctx.setItems(items)
    ctx.setOpen(false)
    return () => ctx.setItems([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}

// Inline numbered pin. Clicking opens the panel.
export function Pin({ n }) {
  const ctx = useContext(Ctx)
  return (
    <button className="pin" title="Open annotations" onClick={() => ctx.setOpen(true)}>{n}</button>
  )
}
