import React from 'react'
import { Link } from 'react-router-dom'

// Hidden route, linked only from the footer watermark.
// The 5-minute walkthrough for the pitch meeting.
export function DemoScript() {
  return (
    <div style={{ maxWidth: 720 }}>
      <h1>Demo script</h1>
      <p className="muted">Five minutes, five beats. This page is hidden; only the footer watermark links here.</p>

      <h2>1. The customer's world (about 90 seconds)</h2>
      <p>
        As <strong>Public Visitor</strong>: open the <Link to="/sectors/sports-clubs">Sports Clubs sector page</Link>,
        then refurbished unit <Link to="/units/SN-2041">SN-2041</Link>. Point out the serialised gallery
        and updated stamp. Toggle two options in the configurator, watch the schematic change, then
        request a quote. Fill the form (use a made-up corporate email; try a gmail address first to
        show the rejection). Review, submit, confirmation. Open the specification summary.
        <strong> Point out that no euro figure has appeared anywhere.</strong>
      </p>

      <h2>2. The hidden half (about 90 seconds)</h2>
      <p>
        Switch role to <strong>Estimator</strong>. The new submission is already in the{' '}
        <Link to="/repo">repository</Link> with the full Commercial Valuation Blueprint calculated:
        NBV, refurb works itemised, transport with county rate and crane surcharge, suggested price,
        margin and RAG flag. Walk the four metrics. Then open <strong>RFQ-1003</strong>, the seeded
        red-margin example: a grade C double-stack with a heavy spec hauled to Donegal. The engine
        catches the bad deal before anyone quotes it. Bump a labour-hours line to show overrides
        with the original struck through.
      </p>

      <h2>3. The yard round trip (about 60 seconds)</h2>
      <p>
        Switch to <strong>Yard Staff</strong>. In the <Link to="/yard">phone frame</Link>, search
        SN-2041, take photos, tag one as defect, publish. Switch back to Public Visitor and open
        SN-2041: photo count and updated stamp have changed. Mention the simulated WebP compression
        badge.
      </p>

      <h2>4. Management control (about 60 seconds)</h2>
      <p>
        Switch to <strong>Management</strong>. On the <Link to="/admin">dashboard</Link>, change
        Cork's transport rate, open RFQ-1002 (Carrigaline GAA, Cork) and show the recalculated
        figure. Nudge the target margin and watch flags move. Show the access matrix and the demand
        charts.
      </p>

      <h2>5. Close (about 30 seconds)</h2>
      <p>
        Open the <Link to="/architecture">architecture panel</Link> and the CRM payload modal on any
        submission. The message: the whole system is understood end to end, and this wireframe's
        logic is real. What is simulated is labelled.
      </p>

      <h2>If something goes wrong</h2>
      <p className="small muted">
        "Reset demo data" in the footer restores the seed state. All data is local to the browser;
        nothing needs a network connection.
      </p>
    </div>
  )
}
