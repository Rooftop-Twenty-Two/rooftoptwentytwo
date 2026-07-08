import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useApp, ROLES } from '../state/AppState.jsx'

// Navigation changes with the active role. Public visitors see the EcoMod
// brand; internal roles see CabinDepot Ops tooling.
const NAV = {
  visitor: [
    { to: '/', label: 'Home', end: true },
    { to: '/sectors/construction-education', label: 'Construction & Education' },
    { to: '/sectors/sports-clubs', label: 'Sports Clubs' },
    { to: '/sectors/retail-services', label: 'Retail & Services' },
    { to: '/units', label: 'Browse units' },
    { to: '/rfq', label: 'Request a quote' },
  ],
  yard: [
    { to: '/yard', label: 'Photo upload tool', end: true },
    { to: '/units', label: 'Public catalogue (read only)' },
  ],
  estimator: [
    { to: '/repo', label: 'Quote repository', end: true },
    { to: '/units', label: 'Public catalogue' },
    { to: '/architecture', label: 'Architecture' },
  ],
  management: [
    { to: '/admin', label: 'Financial dashboard', end: true },
    { to: '/repo', label: 'Quote repository' },
    { to: '/architecture', label: 'Architecture' },
    { to: '/units', label: 'Public catalogue' },
  ],
}

export function Layout({ children }) {
  const { state, dispatch } = useApp()
  const internal = state.role !== 'visitor'
  const nav = NAV[state.role] || NAV.visitor

  return (
    <>
      <header className="app-header">
        <div className="brand">
          {internal ? 'CabinDepot Ops' : 'EcoMod'}
          <small>{internal ? 'Internal. EcoMod Group' : 'Modular units, bought outright'}</small>
        </div>
        <nav className="app-nav">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>{item.label}</NavLink>
          ))}
        </nav>
        <div className="role-switcher">
          <span>Role</span>
          <select value={state.role} onChange={(e) => dispatch({ type: 'setRole', role: e.target.value })}>
            {ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </div>
      </header>
      <main className="page">{children}</main>
      <Toasts />
      <footer className="footer-watermark">
        <Link to="/demo-script">WIREFRAME — R22 CONCEPT DEMO</Link>
        {' · '}
        <button
          className="btn-small"
          style={{ border: 'none', background: 'none', color: '#9a9a9a', letterSpacing: '.22em', textTransform: 'uppercase', fontSize: '.72rem', textDecoration: 'underline' }}
          onClick={() => { dispatch({ type: 'reset' }); }}
        >
          Reset demo data
        </button>
      </footer>
    </>
  )
}

function Toasts() {
  const { state } = useApp()
  if (!state.toasts.length) return null
  return (
    <div className="toasts">
      {state.toasts.map((t) => <div className="toast" key={t.id}>{t.msg}</div>)}
    </div>
  )
}

// Gate for internal pages: shows a role prompt instead of the content when
// the active role should not see it. This is the live demo of the RFP's
// role separation requirement.
export function RequireRole({ roles, children }) {
  const { state, dispatch } = useApp()
  if (roles.includes(state.role)) return children
  const target = roles[0]
  const label = ROLES.find((r) => r.id === target)?.label || target
  return (
    <div className="access-note">
      <h2>Not visible to this role</h2>
      <p>This screen is internal. The {ROLES.find((r) => r.id === state.role)?.label} role cannot see it, and in production it sits behind server-side access control.</p>
      <button className="btn-primary" onClick={() => dispatch({ type: 'setRole', role: target })}>
        Switch to {label}
      </button>
    </div>
  )
}
