import React from 'react'
import { PageAnnotations, Pin } from '../components/Annotations.jsx'

// A talking slide, not a build. Simple boxes on purpose.
const Box = ({ title, sub, wide }) => (
  <div className="card" style={{ textAlign: 'center', gridColumn: wide ? '1 / -1' : undefined }}>
    <strong style={{ color: 'var(--navy)' }}>{title}</strong>
    <p className="small muted" style={{ margin: '4px 0 0' }}>{sub}</p>
  </div>
)

const Arrow = () => (
  <div style={{ textAlign: 'center', color: '#9a9a9a', fontSize: '1.1rem', padding: '2px 0' }}>↓</div>
)

export function Architecture() {
  return (
    <>
      <PageAnnotations items={[
        { title: 'The separation is physical, not cosmetic.', body: ' The public frontend and the financial engine are different deployments. The browser never downloads a financial variable; the engine runs in serverless functions against an encrypted parameter store.' },
        { title: 'Media pipeline.', body: ' Yard uploads land in object storage and are compressed, resized and converted to WebP/AVIF automatically before the public site ever references them.' },
        { title: 'For discussion.', body: ' Named services are suggestions to open the conversation, not commitments. The shape is what matters: static edge frontend, headless content, isolated financial services.' },
      ]} />
      <h1>Proposed production architecture</h1>
      <p className="muted">For discussion. <Pin n={3} /> The wireframe you have been clicking simulates every box below in the browser.</p>

      <div style={{ maxWidth: 720 }}>
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <Box title="Public frontend" sub="Astro/React on Cloudflare Pages. Static, fast, no financial data ever shipped to it." />
          <Box title="Yard staff PWA" sub="Mobile upload tool. Same codebase, role-gated routes." />
        </div>
        <Arrow />
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <Box title="Headless CMS" sub="Sanity or similar. Unit content, sector pages, FAQs. Editable by EcoMod staff." />
          <Box title="Cloud object storage + image pipeline" sub="Uploads compressed, resized, converted to WebP/AVIF on arrival. Serialised galleries per unit." />
        </div>
        <Arrow />
        <Box wide title="Serverless cost engine" sub="Runs on every RFQ submission. NBV, refurb works, transport, margin. Same pure function as src/lib/costEngine.js in this demo. Public layer never sees inputs or outputs." />
        <Arrow />
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <Box title="Encrypted parameter store" sub="Rates, costs, margin baselines. Management-editable, change-logged, encrypted at rest." />
          <Box title="CRM / ERP integration" sub="API push of the dual dataset: customer specification and commercial valuation as linked, separate objects." />
        </div>
        <Arrow />
        <Box wide title="Alerts and documents" sub="Internal sales alerts by email/Teams. Customer specification summary generated server-side as PDF and emailed. Audit trail on every record." />
      </div>
      <p className="small muted section-gap"><Pin n={1} /> <Pin n={2} /> Pins explain the two decisions that matter most.</p>
    </>
  )
}
