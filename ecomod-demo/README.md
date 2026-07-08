# EcoMod modular sales platform. Working wireframe demo

R22 concept demo for The EcoMod Group pitch. It looks like a wireframe on purpose
(greyscale, placeholder imagery, coral annotation pins) but the logic underneath is real:
form validation, a live margin engine, dual dataset generation and role-based views.

## Run it

```
cd ecomod-demo
npm install && npm run dev
```

No backend, no auth, no external services. All data is local JSON seed files plus
localStorage, so nothing is lost mid-demo. Anything that would be cloud-side in production
(uploads, PDF generation, CRM push, email alerts) is simulated and labelled as simulated.
"Reset demo data" in the footer restores the seed state.

Use the coral role switcher in the header: Public Visitor, Yard Staff (CabinDepot),
Estimator, Management. Naming: EcoMod is the customer-facing brand, CabinDepot Ops is the
internal yard and operations tooling.

The cost engine is one pure, commented function in `src/lib/costEngine.js` if anyone in
the room asks to see it.

## Demo script (backup copy, also at /demo-script in the app footer)

**1. The customer's world (about 90 seconds).**
As Public Visitor: Sports Clubs sector page, then refurbished unit SN-2041. Point out the
serialised gallery and updated stamp. Toggle two options in the configurator, watch the
schematic change, then request a quote. Fill the form (try a gmail address first to show
the corporate-email rejection). Review, submit, confirmation, specification summary.
Point out that no euro figure has appeared anywhere.

**2. The hidden half (about 90 seconds).**
Switch to Estimator. The new submission is already in the repository with the full
Commercial Valuation Blueprint calculated: NBV, itemised refurb works, transport with
county rate and crane surcharge, suggested price, margin and RAG flag. Walk the four
metrics. Open RFQ-1003, the seeded red-margin example (grade C double-stack, heavy spec,
Donegal haul). Bump a labour-hours line to show overrides with the original struck through.

**3. The yard round trip (about 60 seconds).**
Switch to Yard Staff. In the phone frame, search SN-2041, take photos, tag one as defect,
publish. Switch back to Public Visitor and open SN-2041: photo count and updated stamp
have changed. Mention the simulated WebP compression badge.

**4. Management control (about 60 seconds).**
Switch to Management. Change Cork's transport rate, open RFQ-1002 (Carrigaline GAA, Cork)
and show the recalculated figure. Nudge the target margin and watch flags move. Show the
access matrix and the demand charts.

**5. Close (about 30 seconds).**
The architecture panel and the CRM payload modal. The message: the whole system is
understood end to end, and what is simulated is labelled.

All figures in the demo are illustrative placeholders.
