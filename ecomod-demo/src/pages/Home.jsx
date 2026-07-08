import React from 'react'
import { Link } from 'react-router-dom'
import { Placeholder } from '../components/Placeholder.jsx'
import { PageAnnotations, Pin } from '../components/Annotations.jsx'

const SECTORS = [
  {
    slug: 'construction-education',
    title: 'Construction & Education',
    blurb: 'Site offices, training classrooms and admin hubs. New or refurbished, delivered and set down.',
  },
  {
    slug: 'sports-clubs',
    title: 'Sports Clubs',
    blurb: 'Committee rooms, admin offices, match-day ticketing hubs and club shops.',
  },
  {
    slug: 'retail-services',
    title: 'Retail & Services',
    blurb: 'Customer service pods, temporary retail outlets, modular bank branches and click-and-collect units.',
  },
]

export function Home() {
  return (
    <>
      <PageAnnotations items={[
        { title: 'No pricing on the public side.', body: ' Nothing a visitor sees carries a euro figure. All costing and margin data lives behind the RFQ, calculated server-side in production. Switch role to Estimator to see the other half.' },
        { title: 'Three dedicated sector entry points.', body: ' Each sector gets its own landing page and ad-campaign destination, with the catalogue pre-filtered. Copy and FAQs are sector-specific.' },
        { title: 'Buy outright, no rental.', body: ' The proposition is Capex only. Copy avoids hire language throughout and the RFQ captures purchase timelines, not rental periods.' },
      ]} />

      <div className="hero">
        <h1>Modular offices and accommodation units. New and refurbished. Yours outright. <Pin n={3} /></h1>
        <p className="muted" style={{ maxWidth: 560 }}>
          EcoMod sells modular units for schools, sites, clubs and shopfronts. Pick a unit,
          configure the layout, and an estimator comes back with a full quote within one working day.
        </p>
        <Placeholder height={190} caption="Hero image: unit being craned onto a prepared base" />
        <p style={{ marginTop: 16 }}>
          <Link to="/units"><button className="btn-primary">Browse units</button></Link>
          {' '}<Pin n={1} />
        </p>
      </div>

      <div className="spread">
        <h2>Who we build for</h2>
        <Pin n={2} />
      </div>
      <div className="grid cols-3">
        {SECTORS.map((s) => (
          <div className="card" key={s.slug}>
            <Placeholder height={110} caption={`Sector image: ${s.title}`} />
            <h3 style={{ marginTop: 10 }}><Link to={`/sectors/${s.slug}`}>{s.title}</Link></h3>
            <p className="small muted">{s.blurb}</p>
            <Link to={`/sectors/${s.slug}`} className="small">See units for this sector</Link>
          </div>
        ))}
      </div>
    </>
  )
}

export { SECTORS }
