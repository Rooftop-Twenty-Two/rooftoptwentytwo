import React from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../state/AppState.jsx'
import { RequireRole } from '../components/Layout.jsx'
import { PageAnnotations, Pin } from '../components/Annotations.jsx'
import { euro } from '../lib/format.js'

export function Admin() {
  return (
    <RequireRole roles={['management']}>
      <AdminInner />
    </RequireRole>
  )
}

function AdminInner() {
  const { state, dispatch } = useApp()
  const { settings } = state

  const num = (v) => (v === '' ? 0 : Number(v))

  return (
    <>
      <PageAnnotations items={[
        { title: 'Everything editable without code.', body: ' Rates, costs, thresholds and inventory values are parameters, not hard-coded numbers. In production they live in an encrypted parameter store with change history, editable through this dashboard.' },
        { title: 'Edits take effect immediately.', body: ' Change Cork\'s haulage rate here, then open the Cork submission (RFQ-1002) in the repository: the valuation recalculates on view. Historic quotes can be locked to their original figures in production.' },
        { title: 'Access is enforced server-side in production.', body: ' The matrix below is the wireframe of the permission model. Financial variables never reach the public application layer and are encrypted at rest.' },
        { title: 'Market intelligence for free.', body: ' Because every lead arrives structured, demand by county and sector falls out of the data. This is the start of the platform as a market intelligence tool, not just a form.' },
      ]} />

      <div className="spread">
        <h1>Financial dashboard</h1>
        <span className="muted small">CabinDepot Ops. Management only. All figures are illustrative placeholders for the demo.</span>
      </div>

      <div className="section-gap panel-split">
        <div>
          <h2>Baseline margin parameters <Pin n={1} /></h2>
          <table style={{ maxWidth: 460 }}>
            <tbody>
              <tr>
                <td>Target margin %</td>
                <td><input type="number" value={settings.targetMarginPct}
                  onChange={(e) => dispatch({ type: 'updateSettings', patch: { targetMarginPct: num(e.target.value) } })} /></td>
              </tr>
              <tr>
                <td><span className="rag green" /> Green at or above %</td>
                <td><input type="number" value={settings.ragGreenPct}
                  onChange={(e) => dispatch({ type: 'updateSettings', patch: { ragGreenPct: num(e.target.value) } })} /></td>
              </tr>
              <tr>
                <td><span className="rag amber" /> Amber at or above %</td>
                <td><input type="number" value={settings.ragAmberPct}
                  onChange={(e) => dispatch({ type: 'updateSettings', patch: { ragAmberPct: num(e.target.value) } })} /></td>
              </tr>
            </tbody>
          </table>

          <h2 style={{ marginTop: 22 }}>Labour rates</h2>
          <table style={{ maxWidth: 460 }}>
            <tbody>
              <tr>
                <td>Standard, per hour</td>
                <td><input type="number" value={settings.labourRates.standard}
                  onChange={(e) => dispatch({ type: 'updateSettings', patch: { labourRates: { ...settings.labourRates, standard: num(e.target.value) } } })} /></td>
              </tr>
              <tr>
                <td>Specialist, per hour</td>
                <td><input type="number" value={settings.labourRates.specialist}
                  onChange={(e) => dispatch({ type: 'updateSettings', patch: { labourRates: { ...settings.labourRates, specialist: num(e.target.value) } } })} /></td>
              </tr>
            </tbody>
          </table>

          <h2 style={{ marginTop: 22 }}>Refurb prep cost by grade</h2>
          <table style={{ maxWidth: 460 }}>
            <tbody>
              {['A', 'B', 'C'].map((g) => (
                <tr key={g}>
                  <td>Grade {g} base preparation</td>
                  <td><input type="number" value={settings.prepCostByGrade[g]}
                    onChange={(e) => dispatch({ type: 'updateSettings', patch: { prepCostByGrade: { ...settings.prepCostByGrade, [g]: num(e.target.value) } } })} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 style={{ marginTop: 22 }}>Crane surcharge tiers</h2>
          <table style={{ maxWidth: 460 }}>
            <thead><tr><th>Unit length at or over</th><th>Fee</th></tr></thead>
            <tbody>
              {settings.craneTiers.map((t, i) => (
                <tr key={i}>
                  <td>{t.minLengthM}m</td>
                  <td><input type="number" value={t.fee}
                    onChange={(e) => dispatch({
                      type: 'updateSettings',
                      patch: { craneTiers: settings.craneTiers.map((x, j) => (j === i ? { ...x, fee: num(e.target.value) } : x)) },
                    })} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h2>Per-county transport rates <Pin n={2} /></h2>
          <p className="small muted">All 32 counties, flat rate from the Dublin depot. Try changing Cork, then open RFQ-1002 in the <Link to="/repo">repository</Link>.</p>
          <div style={{ maxHeight: 420, overflowY: 'auto', border: '1px solid #d4d4d4' }}>
            <table>
              <thead><tr><th>County</th><th>Haulage rate</th></tr></thead>
              <tbody>
                {state.counties.map((c) => (
                  <tr key={c.name}>
                    <td>{c.name}</td>
                    <td><input type="number" value={c.rate}
                      onChange={(e) => dispatch({ type: 'updateCounty', name: c.name, rate: num(e.target.value) })} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="section-gap">
        <h2>Refurb options catalogue</h2>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr><th>Option</th><th>Parts cost</th><th>Labour hours</th><th>Rate type</th><th>Sell price</th></tr>
            </thead>
            <tbody>
              {state.options.map((o) => (
                <tr key={o.id}>
                  <td>{o.name}</td>
                  <td><input type="number" value={o.partsCost}
                    onChange={(e) => dispatch({ type: 'updateOption', id: o.id, patch: { partsCost: num(e.target.value) } })} /></td>
                  <td><input type="number" value={o.labourHours}
                    onChange={(e) => dispatch({ type: 'updateOption', id: o.id, patch: { labourHours: num(e.target.value) } })} /></td>
                  <td>
                    <select value={o.rateType}
                      onChange={(e) => dispatch({ type: 'updateOption', id: o.id, patch: { rateType: e.target.value } })}>
                      <option value="standard">standard</option>
                      <option value="specialist">specialist</option>
                    </select>
                  </td>
                  <td><input type="number" value={o.sellPrice}
                    onChange={(e) => dispatch({ type: 'updateOption', id: o.id, patch: { sellPrice: num(e.target.value) } })} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section-gap">
        <h2>Unit inventory</h2>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr><th>Serial / ID</th><th>Type</th><th>Condition</th><th>Grade</th><th>NBV</th><th>Guide sell price</th><th>Stock status</th></tr>
            </thead>
            <tbody>
              {state.units.map((u) => (
                <tr key={u.id}>
                  <td>{u.serial || u.id}</td>
                  <td className="small">{u.name}</td>
                  <td className="small">{u.condition}</td>
                  <td>
                    {u.condition === 'refurbished' ? (
                      <select value={u.grade} onChange={(e) => dispatch({ type: 'updateUnit', id: u.id, patch: { grade: e.target.value } })}>
                        {['A', 'B', 'C'].map((g) => <option key={g}>{g}</option>)}
                      </select>
                    ) : <span className="muted small">n/a</span>}
                  </td>
                  <td><input type="number" value={u.nbv}
                    onChange={(e) => dispatch({ type: 'updateUnit', id: u.id, patch: { nbv: num(e.target.value) } })} /></td>
                  <td><input type="number" value={u.listPrice}
                    onChange={(e) => dispatch({ type: 'updateUnit', id: u.id, patch: { listPrice: num(e.target.value) } })} /></td>
                  <td>
                    <select value={u.status} onChange={(e) => dispatch({ type: 'updateUnit', id: u.id, patch: { status: e.target.value } })}>
                      <option value="in-stock">In stock</option>
                      <option value="reserved">Reserved</option>
                      <option value="sold">Sold</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <DemandStrip />
      <AccessMatrix />
    </>
  )
}

// Simple greyscale bar charts: submissions by county and by sector.
function DemandStrip() {
  const { state } = useApp()
  const byCounty = {}
  const bySector = {}
  const sectorLabel = { 'construction-education': 'Construction & Ed', 'sports-clubs': 'Sports Clubs', 'retail-services': 'Retail & Services' }
  state.submissions.forEach((s) => {
    byCounty[s.county] = (byCounty[s.county] || 0) + 1
    bySector[s.sector] = (bySector[s.sector] || 0) + 1
  })
  const max = (obj) => Math.max(1, ...Object.values(obj))
  const rows = (obj, labelMap) => Object.entries(obj).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
    <div className="bar-row" key={k}>
      <span className="bar-label">{labelMap ? labelMap[k] : k}</span>
      <div className="bar" style={{ width: `${(v / max(obj)) * 220}px` }} />
      <span className="bar-val">{v}</span>
    </div>
  ))
  return (
    <div className="section-gap panel-split">
      <div className="card">
        <h2>Demand by county <Pin n={4} /></h2>
        {rows(byCounty)}
      </div>
      <div className="card">
        <h2>Demand by sector</h2>
        {rows(bySector, sectorLabel)}
      </div>
    </div>
  )
}

function AccessMatrix() {
  const tick = <span style={{ color: 'var(--ink)', fontWeight: 700 }}>Yes</span>
  const cross = <span style={{ color: 'var(--grey-4)' }}>No</span>
  return (
    <div className="section-gap">
      <h2>Access control <Pin n={3} /></h2>
      <p className="small muted">Wireframe of the permission model. Enforced server-side in production; financial variables never reach the public application layer and are encrypted at rest.</p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ maxWidth: 780 }}>
          <thead>
            <tr><th>Capability</th><th>Visitor</th><th>Yard staff</th><th>Estimator</th><th>Management</th></tr>
          </thead>
          <tbody>
            <tr><td>Browse catalogue and submit RFQ</td><td>{tick}</td><td>{tick}</td><td>{tick}</td><td>{tick}</td></tr>
            <tr><td>See any pricing or financial data</td><td>{cross}</td><td>{cross}</td><td>{tick}</td><td>{tick}</td></tr>
            <tr><td>Upload and publish unit media</td><td>{cross}</td><td>{tick}</td><td>{cross}</td><td>{tick}</td></tr>
            <tr><td>View quote repository and blueprints</td><td>{cross}</td><td>{cross}</td><td>{tick}</td><td>{tick}</td></tr>
            <tr><td>Override valuation lines</td><td>{cross}</td><td>{cross}</td><td>{tick}</td><td>{tick}</td></tr>
            <tr><td>Edit rates, costs and margin baselines</td><td>{cross}</td><td>{cross}</td><td>{cross}</td><td>{tick}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
