import React, { useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useApp } from '../state/AppState.jsx'
import { RequireRole } from '../components/Layout.jsx'
import { Modal } from '../components/Modal.jsx'
import { Placeholder } from '../components/Placeholder.jsx'
import { PageAnnotations, Pin } from '../components/Annotations.jsx'
import { computeValuation } from '../lib/costEngine.js'
import { euro, fmtDate, fmtDateTime, timeSince, hoursSince } from '../lib/format.js'
import { COMPLIANCE_PURPOSES } from '../data/settings.js'

const STATUSES = ['New', 'Under Review', 'Quoted', 'Won', 'Lost']
const SECTOR_LABEL = {
  'construction-education': 'Construction & Education',
  'sports-clubs': 'Sports Clubs',
  'retail-services': 'Retail & Services',
}

function useValuation(sub) {
  const { state } = useApp()
  return useMemo(() => {
    if (!sub) return null
    const unit = state.units.find((u) => u.id === sub.unitId)
    if (!unit) return null
    return computeValuation({
      unit,
      optionIds: sub.optionIds,
      county: sub.county,
      options: state.options,
      counties: state.counties,
      settings: state.settings,
      overrides: sub.overrides,
    })
  }, [sub, state.units, state.options, state.counties, state.settings])
}

// ---------------------------------------------------------------- list ----
export function Repo() {
  return (
    <RequireRole roles={['estimator', 'management']}>
      <RepoInner />
    </RequireRole>
  )
}

function RepoInner() {
  const { state, dispatch, findDuplicate } = useApp()
  const navigate = useNavigate()
  const subs = [...state.submissions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return (
    <>
      <PageAnnotations items={[
        { title: 'Every submission, one pipeline.', body: ' New to Under Review to Quoted to Won or Lost. Status changes are logged to each record\'s audit trail.' },
        { title: 'Margin flag at a glance.', body: ' The RAG dot is the cost engine\'s verdict against the baseline target margin. The red row is the seeded bad deal: a grade C double-stack hauled to Donegal.' },
        { title: 'SLA discipline.', body: ' The public site promises a response within one working day. Any New submission older than 24 hours shows a warning here, turning the promise into a working practice.' },
        { title: 'Duplicate detection.', body: ' A submission matching an existing company name or contact email is flagged against the earlier reference, so two estimators never work the same lead.' },
      ]} />
      <div className="spread">
        <h1>Quote repository <Pin n={1} /></h1>
        <span className="muted small">{subs.length} submissions. Valuations recalculated live from current rates.</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Ref</th><th>Company</th><th>Sector</th><th>County</th><th>Purpose</th>
              <th>Date required</th><th>Submitted <Pin n={3} /></th><th>Status</th><th>Margin <Pin n={2} /></th>
            </tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <RepoRow key={s.ref} sub={s}
                dup={findDuplicate(s)}
                onOpen={() => navigate(`/repo/${s.ref}`)}
                onStatus={(status) => dispatch({
                  type: 'updateSubmission', ref: s.ref, patch: { status },
                  auditEvent: `Status changed to ${status} by estimator`,
                })} />
            ))}
          </tbody>
        </table>
      </div>
      <p className="small muted section-gap"><Pin n={4} /> Rows flagged "possible duplicate" match an earlier submission's company or email.</p>
    </>
  )
}

function RepoRow({ sub, dup, onOpen, onStatus }) {
  const val = useValuation(sub)
  const slaBreach = sub.status === 'New' && hoursSince(sub.createdAt) >= 24
  return (
    <tr className="clickable" onClick={onOpen}>
      <td><strong>{sub.ref}</strong>{dup && <div className="small" style={{ color: 'var(--amber)' }}>Possible duplicate of {dup}</div>}</td>
      <td>{sub.company.name}</td>
      <td className="small">{SECTOR_LABEL[sub.sector]}</td>
      <td>{sub.county}</td>
      <td className="small">{sub.purpose}</td>
      <td className="small">{sub.timeline.flexible ? `Flexible (${sub.timeline.quarter})` : fmtDate(sub.timeline.date)}</td>
      <td className="small">
        {timeSince(sub.createdAt)}
        {slaBreach && <div className="sla-warn small">SLA: over 24h without response</div>}
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <select value={sub.status} onChange={(e) => onStatus(e.target.value)}>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </td>
      <td>
        {val && <><span className={`rag ${val.flag}`} /><span className={`rag-label ${val.flag} small`}>{val.marginPct}%</span></>}
      </td>
    </tr>
  )
}

// -------------------------------------------------------------- detail ----
export function RepoDetail() {
  return (
    <RequireRole roles={['estimator', 'management']}>
      <RepoDetailInner />
    </RequireRole>
  )
}

function RepoDetailInner() {
  const { ref } = useParams()
  const { state, dispatch, toast, findDuplicate } = useApp()
  const [showCrm, setShowCrm] = useState(false)
  const sub = state.submissions.find((s) => s.ref === ref)
  const val = useValuation(sub)
  if (!sub) return <p>Not found. <Link to="/repo">Back to repository</Link></p>
  const unit = state.units.find((u) => u.id === sub.unitId)
  const dup = findDuplicate(sub)
  const compliance = COMPLIANCE_PURPOSES[sub.purpose]
  const currentVersion = sub.versions[sub.versions.length - 1]

  const setOverride = (key, value, label) => {
    const overrides = { ...sub.overrides }
    if (value === '' || value === null) {
      delete overrides[key]
      dispatch({ type: 'updateSubmission', ref: sub.ref, patch: { overrides }, auditEvent: `Estimator override removed on ${label}` })
    } else {
      overrides[key] = Number(value)
      dispatch({ type: 'updateSubmission', ref: sub.ref, patch: { overrides }, auditEvent: `Estimator override on ${label}: ${value}` })
    }
  }

  const reviseQuote = () => {
    const n = currentVersion.n + 1
    dispatch({
      type: 'updateSubmission', ref: sub.ref,
      patch: { versions: [...sub.versions, { n, createdAt: new Date().toISOString(), note: `Revision v${n} started by estimator` }] },
      auditEvent: `Quote revised to v${n}, previous version retained`,
    })
    toast(`Version v${n} created. Change history retained.`)
  }

  const crmPayload = {
    customer_specification: {
      reference: sub.ref,
      submitted_at: sub.createdAt,
      organisation: sub.company,
      contact: sub.contact,
      project: {
        county: sub.county,
        purpose: sub.purpose,
        timeline: sub.timeline.flexible ? { flexible: true, target_quarter: sub.timeline.quarter } : { flexible: false, target_date: sub.timeline.date },
      },
      unit: { id: unit?.id, name: unit?.name, serial: unit?.serial, condition: unit?.condition },
      options: sub.optionIds,
      version: currentVersion.n,
    },
    commercial_valuation: val && {
      reference: sub.ref,
      net_book_value: val.nbv.value,
      refurbishment_works: {
        base_preparation: val.prep.value,
        options: val.optionLines.map((o) => ({ id: o.id, parts: o.parts.value, labour_hours: o.hours.value, labour_rate: o.rate, labour: o.labour, total: o.total })),
        total: val.refurbWorks,
      },
      transport: { county: sub.county, haulage: val.transport.value, crane_surcharge: val.crane.value, total: val.transportTotal },
      total_projected_cost: val.totalCost,
      suggested_sell_price: val.sellPrice.value,
      gross_margin_eur: val.marginEuro,
      gross_margin_pct: val.marginPct,
      rag_flag: val.flag,
      has_estimator_overrides: val.hasOverrides,
    },
  }

  return (
    <>
      <PageAnnotations items={[
        { title: 'One submission, two datasets.', body: ' The RFP\'s core requirement. Left panel is the customer\'s specification, exactly as they see it. Right panel is the Commercial Valuation Blueprint, which never leaves the internal system. In production the two are stored and transmitted separately.' },
        { title: 'Overrides are auditable.', body: ' An estimator can adjust any line. The engine\'s original figure stays visible struck through, the margin recalculates live, and the change lands in the audit trail.' },
        { title: 'Purpose-driven compliance.', body: ' Educational and club uses trigger an internal note to check fire cert and universal access before quoting. This is why the public form asks for purpose.' },
        { title: 'CRM push.', body: ' In production this payload goes by API into EcoMod\'s CRM or ERP as two linked objects, mirroring the separation on screen.' },
        { title: 'Versioning.', body: ' Revise quote creates v2 with history retained: the path from lead capture to a full quoting workflow.' },
      ]} />

      <p className="small"><Link to="/repo">Repository</Link> / {sub.ref}</p>
      <div className="spread">
        <h1>{sub.ref}: {sub.company.name}</h1>
        <div className="inline-flex">
          <span className="badge">v{currentVersion.n}</span>
          <select value={sub.status} onChange={(e) => dispatch({
            type: 'updateSubmission', ref: sub.ref, patch: { status: e.target.value },
            auditEvent: `Status changed to ${e.target.value} by estimator`,
          })}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <button onClick={reviseQuote}>Revise quote</button>
          <Pin n={5} />
        </div>
      </div>
      {dup && <p className="small" style={{ color: 'var(--amber)' }}><strong>Possible duplicate of {dup}.</strong> Same company or contact email as an earlier submission.</p>}
      <p className="muted small">Submitted {fmtDateTime(sub.createdAt)} ({timeSince(sub.createdAt)}). {sub.status === 'New' && hoursSince(sub.createdAt) >= 24 && <span className="sla-warn">Over the 24 hour response promise.</span>}</p>

      <div className="panel-split section-gap">
        {/* Customer-facing half */}
        <div className="panel-customer">
          <h3>Specification summary (customer-facing) <Pin n={1} /></h3>
          <p className="small muted">Exactly what the customer sees. No pricing.</p>
          <dl className="kv">
            <dt>Organisation</dt><dd>{sub.company.name}</dd>
            <dt>Address</dt><dd>{sub.company.address}</dd>
            <dt>Contact</dt><dd>{sub.contact.name}, {sub.contact.phone}, {sub.contact.email}</dd>
            <dt>County</dt><dd>Co. {sub.county}</dd>
            <dt>Timeline</dt><dd>{sub.timeline.flexible ? `Flexible, ${sub.timeline.quarter}` : fmtDate(sub.timeline.date)}</dd>
            <dt>Purpose</dt><dd>{sub.purpose}</dd>
            <dt>Unit</dt><dd>{unit?.name} {unit?.serial ? `(${unit.serial}, grade ${unit.grade})` : ''}</dd>
            <dt>Options</dt><dd>{sub.optionIds.length ? sub.optionIds.map((id) => state.options.find((o) => o.id === id)?.name).join(', ') : 'None'}</dd>
          </dl>
          <Placeholder height={110} caption="Customer's selected layout imagery" />
          <p className="small" style={{ marginTop: 8 }}>
            <Link to={`/spec/${sub.ref}`}>Open customer copy</Link>
          </p>
        </div>

        {/* Internal half */}
        <div className="panel-internal">
          <h3><span className="badge" style={{ borderColor: 'var(--navy)', color: 'var(--navy)' }}>Internal</span> Commercial valuation blueprint <Pin n={2} /></h3>
          {compliance && (
            <p className="small" style={{ border: '1px solid var(--amber)', padding: '6px 9px', color: 'var(--amber)' }}>
              <strong>Compliance:</strong> {compliance} <Pin n={3} />
            </p>
          )}
          {val && <BlueprintTable val={val} setOverride={setOverride} settings={state.settings} />}
          <div className="inline-flex" style={{ marginTop: 12 }}>
            <button className="btn-primary" onClick={() => setShowCrm(true)}>Push to CRM (simulated)</button>
            <Pin n={4} />
          </div>
        </div>
      </div>

      <div className="panel-split section-gap">
        <div>
          <h2>Internal sales alert</h2>
          <div className="alert-card">
            <p style={{ margin: 0 }}><strong>To:</strong> sales-management@ecomod.ie<br />
              <strong>Subject:</strong> New RFQ {sub.ref}: {sub.company.name}, Co. {sub.county}</p>
            <hr style={{ border: 'none', borderTop: '1px solid #ececec' }} />
            <p className="small">
              New request from <strong>{sub.company.name}</strong> ({sub.purpose}, Co. {sub.county}).
              Unit: {unit?.name}{unit?.serial ? ` (${unit.serial})` : ''}.
              Secure link to full record, customer configuration, visual selections and financial
              breakdown: <span style={{ textDecoration: 'underline' }}>ops.ecomod.ie/rfq/{sub.ref}</span>
            </p>
            {val && (
              <p className="small" style={{ margin: 0 }}>
                Total cost {euro(val.totalCost)}. Suggested price {euro(val.sellPrice.value)}.
                Margin {euro(val.marginEuro)} ({val.marginPct}%).{' '}
                <span className={`rag-label ${val.flag}`}>{val.flag.toUpperCase()}</span>
              </p>
            )}
            <button className="btn-small" style={{ marginTop: 10 }}
              onClick={() => toast('Sales alert resent to management (simulated)')}>
              Resend alert (simulated)
            </button>
          </div>
        </div>
        <div>
          <h2>Audit trail</h2>
          <table>
            <tbody>
              {[...sub.audit].reverse().map((a, i) => (
                <tr key={i}>
                  <td className="small" style={{ whiteSpace: 'nowrap' }}>{fmtDateTime(a.ts)}</td>
                  <td className="small">{a.event}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {sub.versions.length > 1 && (
            <>
              <h3 style={{ marginTop: 14 }}>Version history</h3>
              <ul className="small">
                {sub.versions.map((v) => <li key={v.n}>v{v.n}, {fmtDateTime(v.createdAt)}: {v.note}</li>)}
              </ul>
            </>
          )}
        </div>
      </div>

      {showCrm && (
        <Modal title="CRM push payload (simulated)" onClose={() => setShowCrm(false)}>
          <p className="small muted">
            In production this is an API push into EcoMod's CRM/ERP. Note the two separated
            objects: the customer specification and the commercial valuation never travel as one
            document.
          </p>
          <pre>{JSON.stringify(crmPayload, null, 2)}</pre>
          <button className="btn-primary" onClick={() => {
            dispatch({ type: 'updateSubmission', ref: sub.ref, patch: {}, auditEvent: 'Pushed to CRM (simulated)' })
            toast('Pushed to CRM (simulated)')
            setShowCrm(false)
          }}>Confirm push (simulated)</button>
        </Modal>
      )}
    </>
  )
}

// The itemised internal costing table with inline estimator overrides.
function BlueprintTable({ val, setOverride, settings }) {
  return (
    <table>
      <tbody>
        <OverrideRow line={val.nbv} onChange={(v) => setOverride('nbv', v, 'NBV')} />
        <OverrideRow line={val.prep} onChange={(v) => setOverride('prep', v, 'base preparation')} />
        {val.optionLines.map((o) => (
          <React.Fragment key={o.id}>
            <OverrideRow line={o.parts} onChange={(v) => setOverride(`opt:${o.id}:parts`, v, `${o.name} parts`)} />
            <tr>
              <td className="small">
                {o.name}: labour{' '}
                <HoursInput line={o.hours} onChange={(v) => setOverride(`opt:${o.id}:hours`, v, `${o.name} labour hours`)} />
                {' '}hrs x {euro(o.rate)}/hr ({o.rateType})
              </td>
              <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                {o.hours.overridden && <span className="strike">{euro(o.labourOriginal)}</span>}
                {euro(o.labour)}
              </td>
            </tr>
          </React.Fragment>
        ))}
        <tr>
          <th className="small">Refurbishment works subtotal</th>
          <th style={{ textAlign: 'right' }}>{euro(val.refurbWorks)}</th>
        </tr>
        <OverrideRow line={val.transport} onChange={(v) => setOverride('transport', v, 'haulage')} />
        <OverrideRow line={val.crane} onChange={(v) => setOverride('crane', v, 'crane surcharge')} />
        <tr>
          <th>Total projected cost</th>
          <th style={{ textAlign: 'right' }}>{euro(val.totalCost)}</th>
        </tr>
        <OverrideRow line={val.sellPrice} onChange={(v) => setOverride('sellPrice', v, 'sell price')} bold />
        <tr>
          <td className="small muted">Price needed for {settings.targetMarginPct}% target</td>
          <td className="small muted" style={{ textAlign: 'right' }}>{euro(val.targetPrice)}</td>
        </tr>
        <tr>
          <th>
            Gross margin{' '}
            <span className={`rag ${val.flag}`} /><span className={`rag-label ${val.flag}`}>{val.flag.toUpperCase()}</span>
          </th>
          <th style={{ textAlign: 'right' }}>{euro(val.marginEuro)} ({val.marginPct}%)</th>
        </tr>
      </tbody>
    </table>
  )
}

function OverrideRow({ line, onChange, bold }) {
  return (
    <tr>
      <td className={bold ? '' : 'small'} style={bold ? { fontWeight: 700 } : {}}>
        {line.label}
        {line.overridden && (
          <button className="btn-small" style={{ marginLeft: 6 }} title="Remove override" onClick={() => onChange('')}>reset</button>
        )}
      </td>
      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {line.overridden && <span className="strike">{euro(line.original)}</span>}
        <input
          type="number"
          value={line.value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 90, textAlign: 'right', fontWeight: bold ? 700 : 400 }}
        />
      </td>
    </tr>
  )
}

function HoursInput({ line, onChange }) {
  return (
    <>
      {line.overridden && <span className="strike">{line.original}</span>}
      <input type="number" value={line.value} onChange={(e) => onChange(e.target.value)}
        style={{ width: 55, textAlign: 'right' }} />
      {line.overridden && (
        <button className="btn-small" style={{ marginLeft: 4 }} title="Remove override" onClick={() => onChange('')}>reset</button>
      )}
    </>
  )
}
