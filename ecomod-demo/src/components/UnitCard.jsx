import React from 'react'
import { Link } from 'react-router-dom'
import { Placeholder } from './Placeholder.jsx'
import { timeSince } from '../lib/format.js'

const STATUS_LABEL = { 'in-stock': 'In stock', reserved: 'Reserved', sold: 'Sold' }

export function UnitCard({ unit }) {
  const isRefurb = unit.condition === 'refurbished'
  return (
    <div className="card">
      {isRefurb ? (
        <Placeholder
          height={120}
          caption={`Refurb unit ${unit.serial}: exterior, uploaded by yard staff`}
        />
      ) : (
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Placeholder height={120} caption="3D render" />
          <Placeholder height={120} caption="Floor plan" />
        </div>
      )}
      <h3 style={{ marginTop: 10 }}>
        <Link to={`/units/${unit.id}`}>{unit.name}</Link>
      </h3>
      <div style={{ marginBottom: 6 }}>
        {isRefurb && <span className="badge">{unit.serial}</span>}
        {isRefurb && <span className={`badge grade-${unit.grade}`}>Grade {unit.grade}</span>}
        <span className="badge">{isRefurb ? 'Refurbished' : 'New'}</span>
        <span className={`badge status-${unit.status}`}>{STATUS_LABEL[unit.status]}</span>
      </div>
      <p className="muted small" style={{ marginBottom: 4 }}>{unit.sizeLabel}</p>
      {isRefurb && (
        <p className="muted small">
          {unit.photos.length} photos{unit.lastUpdated ? `, updated ${timeSince(unit.lastUpdated)}` : ''}
        </p>
      )}
      <Link to={`/units/${unit.id}`} className="small">View unit</Link>
    </div>
  )
}
