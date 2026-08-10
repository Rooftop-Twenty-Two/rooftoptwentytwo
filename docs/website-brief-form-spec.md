# New Website Brief — form spec

A build brief for the "New Website Brief" form. Written so it can be handed
straight to JotForm (or any form builder), and so it matches the on-site version
at `/website-brief/` (`website/src/pages/website-brief.astro`). Keep the two in
sync: if a question or option changes here, change it there too.

## Purpose

Let a prospective client brief us on a new website in one sitting. The answers
feed our proposal and quote, so the form should be thorough but easy to skip
through. Only a handful of fields are required.

## Recommended form settings

- **Layout:** multi-page (one page per section below, 6 pages) with a progress
  bar. It's a long form; paging keeps it from feeling heavy. A single long page
  is fine too.
- **Required fields:** First name, Last name, Email, Company. Everything else
  optional — people should be able to submit with what they know.
- **Thank-you / redirect:** send to `https://rooftoptwentytwo.ie/thank-you/`
  (the site already has this page). Otherwise use a warm thank-you message:
  "Thanks, we've got your brief. We read every one properly and we'll be in
  touch soon."
- **Notifications:** email the completed brief to the team inbox
  (hey@rooftoptwentytwo.ie). Send the submitter an autoreply confirmation.
- **Spam:** enable JotForm's honeypot/CAPTCHA. (The on-site version uses a
  hidden `website` honeypot field — leave it empty.)
- **Voice:** follow `docs/content-style-guide.md`. Plain, warm, Irish/British
  spelling, sentence case, no em dashes joining clauses.

## Field types legend

- **Short text** — single-line input
- **Long text** — multi-line textarea
- **Single choice** — radio buttons (pick one)
- **Multiple choice** — checkboxes (tick all that apply)
- **Date** — date picker

---

## Section 01 — Your details

| # | Label | Type | Required | Notes |
|---|-------|------|----------|-------|
| 1 | First name | Short text | Yes | |
| 2 | Last name | Short text | Yes | |
| 3 | Email | Short text (email) | Yes | |
| 4 | Phone | Short text (phone) | No | |
| 5 | Company | Short text | Yes | |
| 6 | Current website | Short text (URL) | No | "If you have one." Placeholder `https://` |

## Section 02 — About your business

All **long text**, all optional.

| # | Label | Help text |
|---|-------|-----------|
| 7 | Summary about the business | Who you are, what you do, and what makes you different. |
| 8 | Our position in the market | Where you sit. Budget, mid-market, premium, and why. |
| 9 | Our competitors are | |
| 10 | Our target audiences are | |
| 11 | Our commercial objectives | What a successful website actually does for the business. |

> Note on Q8: responses to date split between a short price-tier answer
> ("premium", "budget") and a longer positioning paragraph. Left as free text so
> it handles both. If you'd rather force a tier, make it single choice:
> Budget · Mid-market · Premium · Luxury.

## Section 03 — Your brand and goals

**Q12 — We have the following brand assets** — *Multiple choice*
Help: "Tick everything you already have. Don't worry about gaps, we can fill them."
- High-resolution logos
- High-res imagery
- Video
- Brand guidelines
- Tone-of-voice guidelines
- Social media profiles

**Q13 — The website must be built to do the following** — *Multiple choice*
- Generate leads
- Capture enquiries
- Take bookings or show a calendar
- Publish blog and news updates
- Update with new products, listings or services
- Offer a brochure download
- Sell online (ecommerce)

## Section 04 — Your current website

All **long text**, all optional.

| # | Label | Help text |
|---|-------|-----------|
| 14 | What we like about our website | |
| 15 | What frustrates us about our website | |
| 16 | Other websites we like | Paste a few links, and a line on what you like about each if you can. |

## Section 05 — Scope and services

**Q17 — How we plan to promote the new website** — *Multiple choice*
- Search engines (SEO)
- Pay per click
- Email
- Social
- Paid social
- Offline (radio, TV, print)
- Events

Follow with **Q17b — Anything else** — *Short text, optional* ("Other ways you'll promote it").

**Q18 — Roughly, how many pages do you foresee the website having?** — *Single choice*
- 1–5
- 5–10
- 10–20
- 20–50
- 50–100

**Q19 — Added services you'd like us to complete** — *Multiple choice*
- Logo or brand identity
- Illustrations
- Website copywriting
- Photography
- Video production

**Q20 — Website functionality** — *Multiple choice*
- About us page
- Enquiry forms
- Blog / news
- Image gallery
- Newsletter signup
- Document downloads
- Data capture
- Maps
- Product catalogue (non-ecommerce)
- Ecommerce
- Integration with a third-party booking system
- Live chat

**Q21 — Going forward, we would like help with** — *Multiple choice*
- Training to use the website
- Performance and monitoring
- Backups
- Ongoing marketing
- Ongoing development
- Service level agreement
- Compliance measures

## Section 06 — Commercials

**Q22 — Our budget for the project is** — *Single choice*
- Under €5k
- €5–10k
- €10–15k
- €15–20k
- €20k+
- Not sure yet

**Q23 — We require the website delivered by** — *Date, optional*

**Q24 — Additional information about the project** — *Long text, optional*

---

## Wiring the on-site form to JotForm

The page at `/website-brief/` posts to JotForm the same way `/contact` and
`/events` do. Once the JotForm form exists:

1. In `website/src/pages/website-brief.astro`, set `JOTFORM_ID` to the new
   form's ID (it's a placeholder right now).
2. Reconcile each field `name` with the names JotForm generates (open the
   JotForm form's HTML source and copy them verbatim, e.g. `q7_company`,
   `brand_assets[]` → whatever JotForm calls the checkbox group).
3. Keep the hidden `formID`, `simple_spc` and `website` honeypot fields.

Until then, the page renders and validates, but submissions won't be delivered.
