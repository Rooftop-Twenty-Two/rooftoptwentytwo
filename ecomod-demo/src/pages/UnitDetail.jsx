import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useApp } from '../state/AppState.jsx'
import { Placeholder } from '../components/Placeholder.jsx'
import { PageAnnotations, Pin } from '../components/Annotations.jsx'
import { fmtDate } from '../lib/format.js'

const STATUS_LABEL = { 'in-stock': 'In stock', reserved: 'Reserved', sold: 'Sold' }

export function UnitDetail() {
  const { id } = useParams()
  const { state } = useApp()
  const navigate = useNavigate()
  const unit = state.units.find((u) => u.id === id)
  const [tab, setTab] = useState(0)
  const [optionIds, setOptionIds] = useState([])

  if (!unit) return <p>Unit not found. <Link to="/units">Back to catalogue</Link></p>

  const isRefurb = unit.condition === 'refurbished'
  const unavailable = unit.status !== 'in-stock'

  const toggleOption = (optId) => {
    setOptionIds((ids) => ids.includes(optId) ? ids.filter((x) => x !== optId) : [...ids, optId])
  }

  const tabs = isRefurb ? [] : ['3D render', 'Elevations', ...unit.floorplans.map((f) => `Plan: ${f}`)]

  return (
    <>
      <PageAnnotations items={[
        isRefurb
          ? { title: 'Serialised photo gallery.', body: ' Every refurbished unit is a unique physical asset. Photos are taken by yard staff on their phones, tagged, and published straight to this page with a last-updated stamp. No prices anywhere.' }
          : { title: 'Standard media set for new units.', body: ' New builds share a media library per model: 3D render, elevations and two or three standard floor plan configurations. CMS-managed in production.' },
        { title: 'Layout configurator.', body: ' Selections update the schematic live and carry into the RFQ, so the estimator receives the exact configuration. In production the schematic becomes a proper visual configurator.' },
        { title: 'Stock status drives the CTA.', body: ' Reserved and Sold units cannot be quoted. The CTA flips to registering interest in similar units, which still captures the lead.' },
        { title: 'Image pipeline.', body: ' In production, uploads are compressed, resized and converted to WebP/AVIF automatically on the way into cloud storage. Pages only ever serve optimised variants.' },
      ]} />

      <p className="small"><Link to="/units">Catalogue</Link> / {unit.name}</p>
      <div className="spread">
        <h1>{unit.name}</h1>
        <div>
          {isRefurb && <span className="badge">{unit.serial}</span>}
          {isRefurb && <span className={`badge grade-${unit.grade}`}>Grade {unit.grade}</span>}
          <span className={`badge status-${unit.status}`}>{STATUS_LABEL[unit.status]}</span>
        </div>
      </div>
      <p className="muted">{unit.sizeLabel}. {unit.blurb}</p>

      {isRefurb ? (
        <>
          <div className="spread">
            <h2>Condition gallery <Pin n={1} /> <Pin n={4} /></h2>
            <span className="muted small">
              {unit.photos.length} photos. Last updated {fmtDate(unit.lastUpdated)} by {unit.updatedBy}.
            </span>
          </div>
          <div className="grid cols-3">
            {unit.photos.map((p, i) => (
              <Placeholder
                key={i}
                height={110}
                badge={p.tag}
                caption={`${unit.serial}: ${p.caption}`}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          <h2>Plans and renders <Pin n={1} /></h2>
          <div className="inline-flex" style={{ marginBottom: 10 }}>
            {tabs.map((t, i) => (
              <button key={t} className={i === tab ? 'btn-primary btn-small' : 'btn-small'} onClick={() => setTab(i)}>{t}</button>
            ))}
          </div>
          <Placeholder height={230} caption={`${unit.name}: ${tabs[tab]} placeholder`} />
        </>
      )}

      <div className="section-gap panel-split">
        <div className="card">
          <h2>Configure this unit <Pin n={2} /></h2>
          <p className="small muted">Base unit: {unit.sizeLabel}. Toggle the options you need. Your selections carry into the quote request.</p>
          {state.options.map((opt) => (
            <label key={opt.id} style={{ fontWeight: 400, display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
              <input
                type="checkbox"
                disabled={unavailable}
                checked={optionIds.includes(opt.id)}
                onChange={() => toggleOption(opt.id)}
              />
              {opt.name}
            </label>
          ))}
          <div style={{ marginTop: 14 }}>
            {unavailable ? (
              <>
                <p className="small muted">This unit is {STATUS_LABEL[unit.status].toLowerCase()}, so it cannot be quoted. <Pin n={3} /></p>
                <button className="btn-primary" onClick={() => navigate('/rfq', { state: { interestUnitId: unit.id } })}>
                  Register interest in similar units
                </button>
              </>
            ) : (
              <button className="btn-primary" onClick={() => navigate('/rfq', { state: { unitId: unit.id, optionIds } })}>
                Request a quote with this configuration
              </button>
            )}
          </div>
        </div>
        <div>
          <h2>Live schematic</h2>
          <Schematic unit={unit} optionIds={optionIds} />
          <p className="small muted">Simple placeholder schematic. Updates as options are toggled.</p>
        </div>
      </div>
    </>
  )
}

// Very simple SVG plan view that reacts to the selected options.
function Schematic({ unit, optionIds }) {
  const has = (id) => optionIds.includes(id)
  const w = 40 + unit.lengthM * 26
  const h = 110
  return (
    <div className="schematic">
      <svg viewBox={`0 0 ${w + 40} ${has('stacking-kit') ? h * 2 + 50 : h + 40}`} style={{ width: '100%', maxHeight: 320 }}>
        {/* stacked upper unit */}
        {has('stacking-kit') && (
          <g>
            <rect x="20" y="15" width={w} height={h} fill="#f7f7f7" stroke="#666" strokeWidth="2" />
            <text x={20 + w / 2} y={15 + h / 2} textAnchor="middle" fontSize="11" fill="#9a9a9a">Upper unit (stacking kit)</text>
          </g>
        )}
        <g transform={`translate(0, ${has('stacking-kit') ? h + 30 : 20})`}>
          <rect x="20" y="0" width={w} height={h} fill="#fff" stroke="#1b1b1b" strokeWidth="2" />
          <text x={20 + w / 2} y={-6 + (has('stacking-kit') ? 0 : 0) + h + 16} textAnchor="middle" fontSize="11" fill="#666">
            {unit.sizeLabel}
          </text>
          {/* partitioning: internal dashed wall */}
          {has('partitioning') && (
            <line x1={20 + w * 0.55} y1="0" x2={20 + w * 0.55} y2={h} stroke="#666" strokeWidth="2" strokeDasharray="6 4" />
          )}
          {/* storefront glazing: thick front edge */}
          {has('storefront-glazing') && (
            <line x1="20" y1={h} x2={20 + w} y2={h} stroke="#9a9a9a" strokeWidth="6" />
          )}
          {/* customer counter */}
          {has('customer-counter') && (
            <rect x={20 + w * 0.15} y={h * 0.6} width={w * 0.3} height="10" fill="#d4d4d4" stroke="#666" />
          )}
          {/* WC pod */}
          {has('wc-pod') && (
            <g>
              <rect x={22} y="2" width={w * 0.2} height={h * 0.35} fill="#ececec" stroke="#666" />
              <text x={22 + w * 0.1} y={h * 0.22} textAnchor="middle" fontSize="9" fill="#666">WC</text>
            </g>
          )}
          {/* electrics pack: socket dots along back wall */}
          {has('electrics-pack') && [0.2, 0.4, 0.6, 0.8].map((f) => (
            <circle key={f} cx={20 + w * f} cy="8" r="3" fill="#666" />
          ))}
          <text x={20 + 4} y={h - 6} fontSize="9" fill="#9a9a9a">door</text>
          <line x1="20" y1={h - 22} x2="34" y2={h - 22} stroke="#666" strokeWidth="2" />
        </g>
      </svg>
    </div>
  )
}
