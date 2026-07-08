import React, { useMemo, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useApp } from '../state/AppState.jsx'
import { PageAnnotations, Pin } from '../components/Annotations.jsx'
import { PURPOSES, CONSUMER_DOMAINS } from '../data/settings.js'
import { fmtDate } from '../lib/format.js'

const QUARTERS = ['Q3 2026', 'Q4 2026', 'Q1 2027', 'Q2 2027', 'Q3 2027']

const SECTOR_BY_PURPOSE = {
  'Classroom expansion': 'construction-education',
  'Training room': 'construction-education',
  'Site office': 'construction-education',
  'Sports club room': 'sports-clubs',
  'Ticketing hub': 'sports-clubs',
  'Club shop': 'sports-clubs',
  'Retail pod': 'retail-services',
  'Click-and-collect': 'retail-services',
  'Bank branch': 'retail-services',
  'Service unit': 'retail-services',
  Other: 'construction-education',
}

export function RFQ() {
  const { state, dispatch, toast, nextRef, findDuplicate } = useApp()
  const location = useLocation()
  const navigate = useNavigate()
  const carried = location.state || {}
  const interestUnit = carried.interestUnitId ? state.units.find((u) => u.id === carried.interestUnitId) : null

  const [step, setStep] = useState('form') // form | review
  const [touched, setTouched] = useState({})
  const [form, setForm] = useState({
    companyName: '',
    address: '',
    contactName: '',
    phone: '',
    email: '',
    county: '',
    timelineMode: 'date', // date | flexible
    date: '',
    quarter: QUARTERS[0],
    purpose: '',
    unitId: carried.unitId || '',
    optionIds: carried.optionIds || [],
  })

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const quotableUnits = state.units.filter((u) => u.status === 'in-stock')

  // Inline validation --------------------------------------------------
  const errors = useMemo(() => {
    const e = {}
    if (!form.companyName.trim()) e.companyName = 'Enter the legal company, organisation or club name.'
    if (!form.address.trim()) e.address = 'Enter the registered address.'
    if (!form.contactName.trim()) e.contactName = 'Enter a contact name.'
    if (!/^[0-9 +()-]{7,}$/.test(form.phone.trim())) e.phone = 'Enter a valid phone number.'
    const email = form.email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      e.email = 'Enter a valid email address.'
    } else {
      const domain = email.split('@')[1]
      if (CONSUMER_DOMAINS.includes(domain)) {
        e.email = 'Please use a corporate or institutional email address rather than a personal one. It helps us verify the organisation and respond faster.'
      }
    }
    if (!form.county) e.county = 'Select the project county.'
    if (form.timelineMode === 'date' && !form.date) e.date = 'Pick a target date, or choose the flexible option.'
    if (!form.purpose) e.purpose = 'Select the purpose of the unit.'
    if (!form.unitId) e.unitId = 'Select a unit.'
    return e
  }, [form])

  const showError = (k) => touched[k] && errors[k]
  const markTouched = (k) => setTouched((t) => ({ ...t, [k]: true }))
  const unit = state.units.find((u) => u.id === form.unitId)

  const tryReview = () => {
    if (Object.keys(errors).length) {
      const all = {}
      Object.keys(errors).forEach((k) => { all[k] = true })
      setTouched((t) => ({ ...t, ...all }))
      toast('Please fix the highlighted fields before reviewing.')
      return
    }
    setStep('review')
    window.scrollTo(0, 0)
  }

  const submit = () => {
    const ref = nextRef()
    const now = new Date().toISOString()
    const submission = {
      ref,
      createdAt: now,
      status: 'New',
      company: { name: form.companyName.trim(), address: form.address.trim() },
      contact: { name: form.contactName.trim(), phone: form.phone.trim(), email: form.email.trim() },
      county: form.county,
      sector: SECTOR_BY_PURPOSE[form.purpose] || 'construction-education',
      timeline: form.timelineMode === 'date'
        ? { date: form.date, flexible: false, quarter: '' }
        : { date: null, flexible: true, quarter: form.quarter },
      purpose: form.purpose,
      unitId: form.unitId,
      optionIds: form.optionIds,
      overrides: {},
      versions: [{ n: 1, createdAt: now, note: 'Original submission' }],
      audit: [
        { ts: now, event: 'RFQ submitted by customer' },
        { ts: now, event: 'Cost engine run, valuation generated' },
        { ts: now, event: 'Internal sales alert sent to management (simulated)' },
      ],
    }
    // The cost engine runs against this submission the moment an internal
    // role views it. The customer sees none of it.
    dispatch({ type: 'addSubmission', submission })
    const dup = findDuplicate(submission)
    if (dup) {
      dispatch({ type: 'updateSubmission', ref, patch: {}, auditEvent: `Flagged as possible duplicate of ${dup}` })
    }
    toast('Internal sales alert emailed to management (simulated)')
    navigate(`/rfq/confirmation/${ref}`)
  }

  const annotations = [
    { title: 'Verified corporate email.', body: ' Free consumer domains (gmail, yahoo, hotmail, outlook) are rejected with a polite ask for an organisational address. This is the RFP\'s lead-quality gate, enforced again server-side in production.' },
    { title: 'Purpose drives compliance.', body: ' The purpose dropdown is not cosmetic. Classroom and sports club answers trigger structural and fire compliance checks on the internal blueprint before an estimator quotes.' },
    { title: 'GDPR.', body: ' Lawful basis: legitimate interest in responding to a B2B enquiry. Retention: enquiry data held 24 months then deleted. Personal contact data and financial valuation data are stored separately; the customer record never contains costing.' },
    { title: 'Review before submit.', body: ' A clear review step cuts bad submissions and gives the customer a copy of exactly what they asked for. On submit, the hidden cost engine runs immediately.' },
    { title: 'All 32 counties.', body: ' The county selected here keys the transport rate table in the cost engine, including Northern Ireland counties.' },
  ]

  if (step === 'review') {
    return (
      <>
        <PageAnnotations items={annotations} />
        <h1>Review your request <Pin n={4} /></h1>
        <p className="muted">Check everything is right. Nothing is sent until you confirm.</p>
        <div className="card" style={{ maxWidth: 640 }}>
          <dl className="kv">
            <dt>Organisation</dt><dd>{form.companyName}</dd>
            <dt>Registered address</dt><dd>{form.address}</dd>
            <dt>Contact</dt><dd>{form.contactName}, {form.phone}, {form.email}</dd>
            <dt>Project county</dt><dd>Co. {form.county}</dd>
            <dt>Timeline</dt>
            <dd>{form.timelineMode === 'date' ? `Target date ${fmtDate(form.date)}` : `Flexible, target ${form.quarter}`}</dd>
            <dt>Purpose</dt><dd>{form.purpose}</dd>
            <dt>Unit</dt><dd>{unit ? unit.name : ''} {unit?.serial ? `(${unit.serial})` : ''}</dd>
            <dt>Options</dt>
            <dd>{form.optionIds.length
              ? form.optionIds.map((id) => state.options.find((o) => o.id === id)?.name).join(', ')
              : 'None'}</dd>
          </dl>
          <div className="inline-flex">
            <button onClick={() => setStep('form')}>Back and edit</button>
            <button className="btn-primary" onClick={submit}>Confirm and send request</button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <PageAnnotations items={annotations} />
      <h1>Request a quote</h1>
      <p className="muted" style={{ maxWidth: 600 }}>
        Tell us what you need and where. An estimator will respond within one working day.
        No payment details, no obligation.
      </p>
      {interestUnit && (
        <div className="alert-card" style={{ maxWidth: 600, marginBottom: 18 }}>
          <strong>{interestUnit.serial || interestUnit.name} is {interestUnit.status}.</strong>{' '}
          You are registering interest in similar units. Pick the closest match below and we will
          come back with comparable stock.
        </div>
      )}

      <fieldset>
        <legend>Organisation</legend>
        <div className="form-row">
          <label>Legal company, organisation or club name</label>
          <input className={showError('companyName') ? 'invalid' : ''} value={form.companyName}
            onChange={(e) => set('companyName', e.target.value)} onBlur={() => markTouched('companyName')} />
          {showError('companyName') && <div className="field-error">{errors.companyName}</div>}
        </div>
        <div className="form-row">
          <label>Registered address</label>
          <input className={showError('address') ? 'invalid' : ''} value={form.address}
            onChange={(e) => set('address', e.target.value)} onBlur={() => markTouched('address')} />
          {showError('address') && <div className="field-error">{errors.address}</div>}
        </div>
      </fieldset>

      <fieldset>
        <legend>Primary contact</legend>
        <div className="form-row">
          <label>Full name</label>
          <input className={showError('contactName') ? 'invalid' : ''} value={form.contactName}
            onChange={(e) => set('contactName', e.target.value)} onBlur={() => markTouched('contactName')} />
          {showError('contactName') && <div className="field-error">{errors.contactName}</div>}
        </div>
        <div className="form-row">
          <label>Phone</label>
          <input className={showError('phone') ? 'invalid' : ''} value={form.phone}
            onChange={(e) => set('phone', e.target.value)} onBlur={() => markTouched('phone')} />
          {showError('phone') && <div className="field-error">{errors.phone}</div>}
        </div>
        <div className="form-row">
          <label>Work email <Pin n={1} /></label>
          <input className={showError('email') ? 'invalid' : ''} value={form.email} type="email"
            onChange={(e) => set('email', e.target.value)} onBlur={() => markTouched('email')} />
          {showError('email') && <div className="field-error">{errors.email}</div>}
        </div>
      </fieldset>

      <fieldset>
        <legend>Project</legend>
        <div className="form-row">
          <label>Project county <Pin n={5} /></label>
          <select className={showError('county') ? 'invalid' : ''} value={form.county}
            onChange={(e) => set('county', e.target.value)} onBlur={() => markTouched('county')}>
            <option value="">Select county</option>
            {state.counties.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
          {showError('county') && <div className="field-error">{errors.county}</div>}
        </div>
        <div className="form-row">
          <label>Project timeline</label>
          <label style={{ fontWeight: 400 }}>
            <input type="radio" checked={form.timelineMode === 'date'} onChange={() => set('timelineMode', 'date')} /> Target date
          </label>
          {form.timelineMode === 'date' && (
            <>
              <input type="date" className={showError('date') ? 'invalid' : ''} value={form.date}
                onChange={(e) => set('date', e.target.value)} onBlur={() => markTouched('date')} />
              {showError('date') && <div className="field-error">{errors.date}</div>}
            </>
          )}
          <label style={{ fontWeight: 400, marginTop: 6 }}>
            <input type="radio" checked={form.timelineMode === 'flexible'} onChange={() => set('timelineMode', 'flexible')} /> Flexible, target quarter
          </label>
          {form.timelineMode === 'flexible' && (
            <select value={form.quarter} onChange={(e) => set('quarter', e.target.value)}>
              {QUARTERS.map((q) => <option key={q}>{q}</option>)}
            </select>
          )}
        </div>
        <div className="form-row">
          <label>Purpose of unit <Pin n={2} /></label>
          <select className={showError('purpose') ? 'invalid' : ''} value={form.purpose}
            onChange={(e) => set('purpose', e.target.value)} onBlur={() => markTouched('purpose')}>
            <option value="">Select purpose</option>
            {PURPOSES.map((p) => <option key={p}>{p}</option>)}
          </select>
          {showError('purpose') && <div className="field-error">{errors.purpose}</div>}
        </div>
      </fieldset>

      <fieldset>
        <legend>Unit and configuration</legend>
        <div className="form-row">
          <label>Unit</label>
          <select className={showError('unitId') ? 'invalid' : ''} value={form.unitId}
            onChange={(e) => set('unitId', e.target.value)} onBlur={() => markTouched('unitId')}>
            <option value="">Select unit</option>
            {quotableUnits.map((u) => (
              <option key={u.id} value={u.id}>{u.name}{u.serial ? ` (${u.serial}, grade ${u.grade})` : ''}</option>
            ))}
          </select>
          {showError('unitId') && <div className="field-error">{errors.unitId}</div>}
        </div>
        <div className="form-row">
          <label>Options</label>
          {state.options.map((opt) => (
            <label key={opt.id} style={{ fontWeight: 400, display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
              <input type="checkbox" checked={form.optionIds.includes(opt.id)}
                onChange={() => set('optionIds', form.optionIds.includes(opt.id)
                  ? form.optionIds.filter((x) => x !== opt.id)
                  : [...form.optionIds, opt.id])} />
              {opt.name}
            </label>
          ))}
        </div>
      </fieldset>

      <p className="small muted" style={{ maxWidth: 560 }}>
        <Pin n={3} /> We use these details to respond to your enquiry. Contact details are kept
        separate from any commercial data, retained for 24 months, then deleted. See the privacy
        notice placeholder.
      </p>
      <button className="btn-primary" onClick={tryReview}>Review request</button>
    </>
  )
}
