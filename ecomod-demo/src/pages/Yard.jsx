import React, { useState } from 'react'
import { useApp } from '../state/AppState.jsx'
import { RequireRole } from '../components/Layout.jsx'
import { PhoneFrame } from '../components/PhoneFrame.jsx'
import { Placeholder } from '../components/Placeholder.jsx'
import { PageAnnotations, Pin } from '../components/Annotations.jsx'
import { fmtDate } from '../lib/format.js'

const TAGS = ['exterior', 'interior', 'detail', 'defect']
const STAFF = ['Marek K. (yard)', 'Dee O’Brien (yard)', 'Tomas L. (yard)']

// Fake camera output: each "take photos" press adds a few tiles with a
// simulated original size so the compression badge means something.
let shotCounter = 0
const takeShots = () => {
  const shots = []
  const n = 3
  for (let i = 0; i < n; i++) {
    shotCounter += 1
    const mb = (2.8 + ((shotCounter * 7) % 23) / 10).toFixed(1)
    const kb = Math.round(mb * 57)
    shots.push({ tag: 'exterior', caption: `Photo ${shotCounter}`, sizeBadge: `${mb} MB → ${kb} KB WebP (simulated)` })
  }
  return shots
}

export function Yard() {
  return (
    <RequireRole roles={['yard', 'management']}>
      <YardInner />
    </RequireRole>
  )
}

function YardInner() {
  const { state, dispatch, toast } = useApp()
  const [search, setSearch] = useState('')
  const [unitId, setUnitId] = useState(null)
  const [pending, setPending] = useState([])
  const [grade, setGrade] = useState('')
  const [staff, setStaff] = useState(STAFF[0])

  const refurbUnits = state.units.filter((u) => u.condition === 'refurbished')
  const matches = refurbUnits.filter((u) =>
    u.serial.toLowerCase().includes(search.toLowerCase()) || u.name.toLowerCase().includes(search.toLowerCase())
  )
  const unit = state.units.find((u) => u.id === unitId)

  const setTag = (i, tag) => setPending((p) => p.map((ph, idx) => (idx === i ? { ...ph, tag } : ph)))
  const setCaption = (i, caption) => setPending((p) => p.map((ph, idx) => (idx === i ? { ...ph, caption } : ph)))

  const publish = () => {
    dispatch({
      type: 'publishPhotos',
      id: unit.id,
      photos: pending.map(({ sizeBadge, ...p }) => p),
      grade: grade || unit.grade,
      staffName: staff,
    })
    toast(`${pending.length} photos published to ${unit.serial}. Public gallery updated.`)
    setPending([])
    setGrade('')
  }

  return (
    <>
      <PageAnnotations items={[
        { title: 'Mobile-first, on purpose.', body: ' This tool is used standing in the yard with a phone. Big targets, short flow: pick serial, shoot, tag, publish. Shown here in a phone frame so it can be demoed on one screen.' },
        { title: 'Automatic image pipeline.', body: ' In production every upload is compressed, resized and converted to WebP/AVIF on the way into cloud object storage. The badge on each tile simulates that saving. Yard staff never think about file sizes.' },
        { title: 'Straight to the public gallery.', body: ' Publishing updates the unit\'s public photo count and last-updated stamp instantly. Switch to the Public Visitor role and open the unit to see the round trip.' },
        { title: 'Media only.', body: ' The yard role sees no financial data at all. Access is scoped to what the job needs.' },
      ]} />

      <div className="spread">
        <h1>Yard photo upload <Pin n={1} /></h1>
        <span className="muted small">CabinDepot Ops. Media only, no financials. <Pin n={4} /></span>
      </div>

      <PhoneFrame>
        {!unit && (
          <>
            <h3>Select unit</h3>
            <input
              placeholder="Search serial, e.g. SN-2041"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', marginBottom: 10 }}
            />
            {matches.map((u) => (
              <div key={u.id} className="card" style={{ marginBottom: 8, padding: 10, cursor: 'pointer' }}
                onClick={() => { setUnitId(u.id); setGrade(u.grade) }}>
                <strong>{u.serial}</strong> <span className={`badge grade-${u.grade}`}>Grade {u.grade}</span>
                <div className="small muted">{u.name}</div>
                <div className="small muted">{u.photos.length} photos, updated {fmtDate(u.lastUpdated)}</div>
              </div>
            ))}
            {matches.length === 0 && <p className="muted small">No refurb units match.</p>}
          </>
        )}

        {unit && (
          <>
            <div className="spread">
              <h3>{unit.serial}</h3>
              <button className="btn-small" onClick={() => { setUnitId(null); setPending([]) }}>Change unit</button>
            </div>
            <p className="small muted">{unit.name}. {unit.photos.length} photos live. Updated {fmtDate(unit.lastUpdated)} by {unit.updatedBy}.</p>

            <div style={{ marginBottom: 10 }}>
              <label>Logged in as</label>
              <select value={staff} onChange={(e) => setStaff(e.target.value)} style={{ width: '100%' }}>
                {STAFF.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            <button className="btn-primary" style={{ width: '100%' }} onClick={() => setPending((p) => [...p, ...takeShots()])}>
              Take photos (simulated multi-upload)
            </button>

            {pending.map((p, i) => (
              <div key={i} className="card" style={{ marginTop: 10, padding: 10 }}>
                <Placeholder height={80} caption={p.sizeBadge} />
                <div style={{ marginTop: 6 }}>
                  <label className="small">Tag <Pin n={2} /></label>
                  <select value={p.tag} onChange={(e) => setTag(i, e.target.value)} style={{ width: '100%' }}>
                    {TAGS.map((t) => <option key={t}>{t}</option>)}
                  </select>
                  <label className="small" style={{ marginTop: 6 }}>Caption</label>
                  <input value={p.caption} onChange={(e) => setCaption(i, e.target.value)} style={{ width: '100%' }} />
                </div>
              </div>
            ))}

            {pending.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <label>Condition grade</label>
                <select value={grade} onChange={(e) => setGrade(e.target.value)} style={{ width: '100%', marginBottom: 10 }}>
                  {['A', 'B', 'C'].map((g) => <option key={g} value={g}>Grade {g}</option>)}
                </select>
                <button className="btn-primary" style={{ width: '100%' }} onClick={publish}>
                  Publish {pending.length} photos
                </button>
                <p className="small muted" style={{ marginTop: 6 }}>Publishing updates the public gallery instantly. <Pin n={3} /></p>
              </div>
            )}
          </>
        )}
      </PhoneFrame>
    </>
  )
}
