import React from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { useApp } from '../state/AppState.jsx'
import { UnitCard } from '../components/UnitCard.jsx'
import { PageAnnotations, Pin } from '../components/Annotations.jsx'

const SECTOR_COPY = {
  'construction-education': {
    title: 'Construction & Education',
    intro: 'Site offices for contractors. Classrooms and admin hubs for schools and training providers. Every unit here suits a construction or education setting, new or refurbished.',
    uses: ['Site offices', 'Training classrooms', 'Admin hubs'],
    faqs: [
      'How quickly can a classroom be on site?',
      'Do refurbished units meet school fire regulations?',
      'What groundwork do we need before delivery?',
    ],
  },
  'sports-clubs': {
    title: 'Sports Clubs',
    intro: 'Committee rooms, admin offices, match-day ticketing hubs and club shops. Built for GAA, rugby, soccer and athletics clubs that need proper space without a building project.',
    uses: ['Committee rooms', 'Admin offices', 'Match-day ticketing hubs', 'Club shops'],
    faqs: [
      'Can a unit be fitted out as a club shop?',
      'What about planning permission on club grounds?',
      'Can we split one unit into a committee room and an office?',
    ],
  },
  'retail-services': {
    title: 'Retail & Services',
    intro: 'Customer service pods, temporary retail outlets, modular bank branches and click-and-collect units. Storefront glazing, counters and partitioning are all configurable.',
    uses: ['Customer service pods', 'Temporary retail outlets', 'Modular bank branches', 'Click-and-collect units'],
    faqs: [
      'Can the unit take full storefront glazing?',
      'How is a click-and-collect unit secured?',
      'Can we relocate the unit later?',
    ],
  },
}

export function Sector() {
  const { slug } = useParams()
  const { state } = useApp()
  const copy = SECTOR_COPY[slug]
  if (!copy) return <Navigate to="/" replace />
  const units = state.units.filter((u) => u.sectors.includes(slug))

  return (
    <>
      <PageAnnotations items={[
        { title: 'Sector-filtered catalogue.', body: ' The grid below is the same unit inventory as the main catalogue, pre-filtered by sector suitability. One inventory, three shop windows.' },
        { title: 'FAQ placeholders.', body: ' Each sector carries its own FAQ content, written for that buyer. In production these are CMS-managed so EcoMod staff edit them without a developer.' },
        { title: 'RFQ is the only conversion path.', body: ' There is no basket and no price. Every CTA funnels to the request-a-quote form, which is where lead capture and the hidden cost engine start.' },
      ]} />

      <h1>{copy.title} <Pin n={1} /></h1>
      <p style={{ maxWidth: 620 }}>{copy.intro}</p>
      <p className="inline-flex">
        {copy.uses.map((u) => <span className="badge" key={u}>{u}</span>)}
      </p>

      <div className="section-gap spread">
        <h2>Units suited to this sector</h2>
        <span className="inline-flex"><Link to="/rfq"><button className="btn-primary">Request a quote</button></Link> <Pin n={3} /></span>
      </div>
      <div className="grid cols-3">
        {units.map((u) => <UnitCard unit={u} key={u.id} />)}
      </div>

      <div className="section-gap">
        <h2>Common questions <Pin n={2} /></h2>
        <div className="grid cols-3">
          {copy.faqs.map((q) => (
            <div className="card" key={q}>
              <strong className="small">{q}</strong>
              <p className="muted small" style={{ marginTop: 6 }}>FAQ answer placeholder. Sector-specific content, CMS-managed in production.</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
