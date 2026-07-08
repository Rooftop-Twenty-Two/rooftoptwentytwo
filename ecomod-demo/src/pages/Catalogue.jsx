import React, { useState } from 'react'
import { useApp } from '../state/AppState.jsx'
import { UnitCard } from '../components/UnitCard.jsx'
import { PageAnnotations, Pin } from '../components/Annotations.jsx'

export function Catalogue() {
  const { state } = useApp()
  const [condition, setCondition] = useState('all')
  const [sector, setSector] = useState('all')
  const [size, setSize] = useState('all')
  const [availability, setAvailability] = useState('all')

  const units = state.units.filter((u) => {
    if (condition !== 'all' && u.condition !== condition) return false
    if (sector !== 'all' && !u.sectors.includes(sector)) return false
    if (size === 'small' && u.lengthM > 4) return false
    if (size === 'medium' && (u.lengthM <= 4 || u.lengthM > 6)) return false
    if (size === 'large' && u.lengthM <= 6) return false
    if (availability !== 'all' && u.status !== availability) return false
    return true
  })

  return (
    <>
      <PageAnnotations items={[
        { title: 'One inventory, two card types.', body: ' New units show render and floor plan placeholders. Refurbished units show their serial number, condition grade and live photo count, because each one is a unique physical asset in the yard.' },
        { title: 'Serialised galleries.', body: ' The photo count and updated stamp come straight from what yard staff publish on their phones. Switch to the Yard Staff role, upload photos to a unit, and watch this page change.' },
        { title: 'Stock status is live.', body: ' Reserved and Sold units stay listed but cannot be quoted, so sales never double-sell a unit that is already gone.' },
      ]} />

      <h1>Unit catalogue <Pin n={1} /></h1>
      <p className="muted">New builds and refurbished stock. No prices here; request a quote and an estimator responds within one working day.</p>

      <div className="filters">
        <div>
          <label>Condition</label>
          <select value={condition} onChange={(e) => setCondition(e.target.value)}>
            <option value="all">All</option>
            <option value="new">New</option>
            <option value="refurbished">Refurbished</option>
          </select>
        </div>
        <div>
          <label>Sector suitability</label>
          <select value={sector} onChange={(e) => setSector(e.target.value)}>
            <option value="all">All sectors</option>
            <option value="construction-education">Construction & Education</option>
            <option value="sports-clubs">Sports Clubs</option>
            <option value="retail-services">Retail & Services</option>
          </select>
        </div>
        <div>
          <label>Size</label>
          <select value={size} onChange={(e) => setSize(e.target.value)}>
            <option value="all">Any size</option>
            <option value="small">Up to 4m</option>
            <option value="medium">4m to 6m</option>
            <option value="large">Over 6m</option>
          </select>
        </div>
        <div>
          <label>Availability</label>
          <select value={availability} onChange={(e) => setAvailability(e.target.value)}>
            <option value="all">All</option>
            <option value="in-stock">In stock</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
          </select>
        </div>
        <span className="muted small">{units.length} of {state.units.length} units <Pin n={3} /></span>
      </div>

      <div className="grid cols-3">
        {units.map((u) => <UnitCard unit={u} key={u.id} />)}
      </div>
      {units.length === 0 && <p className="muted">No units match those filters.</p>}
      <p className="small muted section-gap">Refurbished photo counts update as yard staff publish. <Pin n={2} /></p>
    </>
  )
}
