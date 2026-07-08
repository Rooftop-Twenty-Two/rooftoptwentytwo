import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useApp } from '../state/AppState.jsx'
import { PageAnnotations, Pin } from '../components/Annotations.jsx'
import { Placeholder } from '../components/Placeholder.jsx'
import { fmtDate } from '../lib/format.js'

export function Confirmation() {
  const { ref } = useParams()
  const { state } = useApp()
  const sub = state.submissions.find((s) => s.ref === ref)
  if (!sub) return <p>Request not found. <Link to="/">Home</Link></p>

  return (
    <>
      <PageAnnotations items={[
        { title: 'Response-time promise.', body: ' The one-working-day promise is not just copy. The internal repository tracks time since submission and warns the team at 24 hours, so the promise is enforced, not hoped for.' },
        { title: 'The engine already ran.', body: ' While the customer reads this page, the full commercial valuation (NBV, refurb works, transport, margin) is already sitting in the estimator\'s repository. Switch role to Estimator and open this reference.' },
      ]} />
      <div style={{ maxWidth: 620 }}>
        <h1>Request received. Thanks. <Pin n={2} /></h1>
        <p>Your reference is <strong>{sub.ref}</strong>, submitted {fmtDate(sub.createdAt)}.</p>
        <p><strong>An estimator will respond within one working day.</strong> <Pin n={1} /></p>
        <p className="muted">We have emailed a copy of your specification to {sub.contact.email} (simulated in this demo).</p>
        <p>
          <Link to={`/spec/${sub.ref}`}><button className="btn-primary">View your specification summary</button></Link>
        </p>
      </div>
    </>
  )
}

// Customer copy of the specification. Print-styled. Deliberately shows no
// pricing of any kind.
export function SpecSummary() {
  const { ref } = useParams()
  const { state, toast } = useApp()
  const sub = state.submissions.find((s) => s.ref === ref)
  if (!sub) return <p>Request not found. <Link to="/">Home</Link></p>
  const unit = state.units.find((u) => u.id === sub.unitId)
  const options = sub.optionIds.map((id) => state.options.find((o) => o.id === id)).filter(Boolean)

  return (
    <>
      <PageAnnotations items={[
        { title: 'Generated server-side in production.', body: ' This customer copy is produced as a PDF from cloud storage assets and emailed automatically on submission. The demo simulates it with a print-styled page.' },
        { title: 'No pricing, by design.', body: ' The customer document lists choices and imagery only. The financial half of the same submission exists solely in the internal repository.' },
      ]} />
      <div style={{ maxWidth: 680 }}>
        <div className="spread no-print">
          <p className="small"><Link to={`/rfq/confirmation/${sub.ref}`}>Back</Link></p>
          <span className="inline-flex">
            <button className="btn-primary" onClick={() => { toast('PDF generated and emailed (simulated)'); window.print() }}>
              Download PDF (simulated)
            </button>
            <Pin n={1} />
          </span>
        </div>
        <h1>Specification summary</h1>
        <p className="muted">Customer copy. Reference {sub.ref}. Prepared for {sub.company.name}.</p>
        <dl className="kv">
          <dt>Organisation</dt><dd>{sub.company.name}</dd>
          <dt>Registered address</dt><dd>{sub.company.address}</dd>
          <dt>Contact</dt><dd>{sub.contact.name}, {sub.contact.phone}, {sub.contact.email}</dd>
          <dt>Project county</dt><dd>Co. {sub.county}</dd>
          <dt>Timeline</dt>
          <dd>{sub.timeline.flexible ? `Flexible, target ${sub.timeline.quarter}` : `Target date ${fmtDate(sub.timeline.date)}`}</dd>
          <dt>Purpose</dt><dd>{sub.purpose}</dd>
          <dt>Unit</dt><dd>{unit?.name} {unit?.serial ? `(${unit.serial}, grade ${unit.grade})` : '(new build)'}</dd>
          <dt>Selected options</dt>
          <dd>{options.length ? options.map((o) => o.name).join(', ') : 'None'}</dd>
        </dl>
        <div className="grid cols-2" style={{ marginBottom: 16 }}>
          <Placeholder height={150} caption={unit?.condition === 'refurbished' ? `${unit.serial}: current condition photo` : `${unit?.name}: 3D render`} />
          <Placeholder height={150} caption="Selected layout schematic" />
        </div>
        <p className="small muted">
          This summary lists your requested specification only. It is not a quotation and contains
          no pricing. <Pin n={2} /> Your estimator will follow up with a full quotation.
        </p>
      </div>
    </>
  )
}
