# Components observed

Catalogue of every distinct UI block in the captured screenshots. Numbered for cross-reference from `components-decided.md`. All decisions in clone mode are ADOPT unless explicitly flagged.

## C1. Header / Nav (universal)

- Sticky horizontal bar over the dark navy canvas.
- **Left:** Rooftop wordmark with small "TWENTY TWO" caption sitting to the right of the wordmark, slightly offset down.
- **Centre:** dotted circular menu trigger (a thin dashed ring with three short stacked lines in the centre forming a hamburger icon).
- **Right:** coral pill CTA `Let's Chat` (`#E15047` fill, white label, no border, ~16px label).
- Header always rendered on a dark navy background even on light-panel pages (no transparency-over-hero variation observed).
- Mobile: same arrangement, sizes scale down. Logo wordmark sits 24px from the left edge, CTA 24px from the right.

## C2. Hero — Home

- Background: full-bleed dark navy.
- Composition: two columns on desktop, stacked on mobile.
- **Left column:**
  - Coral Starlit Drive script "Successing" at ~3rem, slightly rotated baseline.
  - Below it, Butler serif headline `businesses for digital success` at ~5rem, white.
  - Body intro: 2-3 lines of mint-tinted sans summarising the studio (`Tailored strategies …`).
  - Two pill CTAs side by side. Primary: mint-filled with navy label. Secondary: mint-outlined with mint label.
- **Right column:**
  - Photo collage of 6 to 8 overlapping rounded images (team portraits + product/lifestyle shots) staggered at slight rotation.
  - Tiles bleed off the right edge of the canvas.

## C3. Client logo bar

- Single horizontal strip on dark navy.
- 5 to 7 monochrome logos in pale grey / `#C2DDDB`, ~24-32px tall, evenly spaced.
- Logos render at low contrast (do not re-saturate them to brand colours).
- Used on `/about/` and as a secondary strip on the home page.

## C4. Section signature (Starlit Drive eyebrow)

- Reusable atom. Single line of Starlit Drive script in coral `#E15047` or mint `#00FFB2`, ~3rem, sitting just above a section's Butler heading.
- Examples observed: `Successing` (home hero), `Our Work` (home, portfolio index), `Team` (about), `Aidan` (about, used as a personal signature), `Get in touch!` (contact), `01` through `05` (portfolio detail section markers, but rendered in Butler with mint short underline rather than Starlit Drive — see C8).

## C5. Services block (light panel on dark canvas)

- Off-white panel (`#ECE8E7` or `#F9F9F9`) inset on the dark navy page, ~80% width, rounded corners ~32px.
- Heading: Butler serif `Brand Design, Web Design, Digital Marketing,` (commas literal, plus a coral Starlit Drive `and more` at the end on the same line). Reads as a single typographic statement.
- Body: three-column list (Brand Design / Website Design / Digital Marketing). Each column has a vertical list of sub-services in Mulish, ~18px, navy text.
- No icons, no hover state observed.

## C6. Team photo grid

- 4-column desktop, 2-column tablet, 1-column mobile.
- Each cell: black-and-white portrait (~340x420 cropped 5:6), name in white Mulish 600 directly under, role in muted grey below the name.
- Photos are **intentionally B&W**. Do not desaturate other photography in sympathy.
- Above the grid is a section signature (C4) `Team` in coral Starlit Drive followed by a Butler line `look big to us` (or similar headline that varies by page).

## C7. Portfolio grid (index page)

- Vertical stack of full-width cards on mobile, single-column on desktop too (cards do NOT sit in a multi-column grid; they are stacked floor-to-ceiling).
- Each card: rounded corners ~32px, ~100% canvas width, ~480-560px tall.
- Card content: large brand artwork or photography filling the card, brand name set in the brand's own logo / wordmark rather than a generic label.
- No hover state details captured in screenshots (states to be designed during build phase from token palette: light scale-1.02, soft shadow lift).

## C8. Portfolio detail — numbered case sections

- Repeating unit on every `/portfolio/<slug>/` page. Five sections labelled `01` through `05`.
- Layout per section: large Butler numeral on the left (`01` etc, ~9rem, white) with a short ~24px mint underline directly below the numeral, and a heading + body block on the right.
- Headings: Butler serif, ~3rem, white.
- Body: Mulish ~18px, soft white / `#C2DDDB`.
- Sections are separated by alternating full-bleed photographic strips (colour photography, never B&W here).

## C9. Hero — Portfolio detail

- Composition: brand name set very large in Butler (typically with the project's own wordmark or a Butler treatment) centred over a collaged image grid.
- Below the hero: a coral Starlit Drive script tagline (e.g. "Strengthening The 1933 Furniture Company's Digital Marketing Strategy").
- Background: dark navy.

## C10. Quote / pull-quote panel

- Observed inside about-page case-style block ("Rooftop Twenty Two has been brilliant to work with..." attributed via Starlit Drive signature beneath).
- Layout: 2-column on desktop. Left = portrait or branded illustration. Right = quote in Butler ~2rem white text, attribution in Starlit Drive coral below.
- No quotation mark glyphs; the typography carries the role.

## C11. Form (contact)

- Layout: 3 single-line fields in a row (Name / Email / Subject), full-width Message textarea below, then a giant mint-filled block functioning as Submit.
- Fields: dark navy `#143A4F` background, rounded ~16px, label sitting top-left inside the field in mint `#00FFB2`, ~12px, semibold. Input text white.
- Submit: a full-height block (not a normal pill button), ~50% of form width, rounded ~32px, mint `#00FFB2` solid fill, navy label centred. Block height matches the combined height of Name + Email + Subject + Message stack on its right; it sits beside the Message field on desktop, full-width below the textarea on mobile.
- Above the form: coral Starlit Drive `Get in touch!`, then the studio intro paragraph (white sans), then two mint pill CTAs for email and phone, then two mint pill CTAs for social (instagram / linkedin), then the rotating dotted "PRESS TO TALK" ring + downward arrow.

## C12. Universal footer / "Let's chat." block

- Repeats on every page captured (home, about, contact, portfolio index, every portfolio detail, terms).
- Background: dark navy.
- **Top half:** giant Butler `Let's chat.` headline left-aligned, ~9rem desktop / ~4rem mobile, with a mint pill CTA `Start your Project` to the right of the headline on desktop, below it on mobile.
- **Lower half (4-column desktop, single column mobile):**
  - Col 1: Our Work / About / Contact link list (white Mulish 500, ~1.125rem).
  - Col 2: `Head Office` label + address block (white Mulish 500).
  - Col 3: `Connect with us` label + linkedin + instagram icon links.
  - Col 4 (desktop only): empty / breathing room (matches the 4-col rhythm of the about page logo bar).
- **Legal strip below:** `© Rooftop Twenty Two. 2026. All rights reserved.` 12px muted, left-aligned.

## C13. PRESS TO TALK rotating ring

- Decorative + functional. Circular dotted ring containing the text `PRESS TO TALK` running around the circle, with a downward arrow icon centred inside.
- Rotates continuously (12s linear infinite per video reference).
- Used on contact page beside the intro. The same dotted-ring pattern with stacked lines appears as the nav menu trigger (C1).

## C14. 404 template

- Light-on-light variant (this is the only page on the source with a white top half).
- Top section: white background, large navy `The page can't be found.` in Butler / sans (the source uses a Butler-esque serif), short sentence below.
- Coral `Let's Chat` pill top-right, same as nav CTA.
- Below: the universal `Let's chat.` block (C12).

## Anti-patterns observed (flag for triage)

None. The current site does not exhibit standard agency anti-patterns (no auto-rotating testimonials, no modal pop-ups, no pricing teasers, no multi-step forms).

## Mobile divergence summary

- C1 nav: identical structure, scaled.
- C2 hero: columns stack, photo collage compresses to ~60% canvas width below copy.
- C5 services: 3 columns collapse to 1 stacked column.
- C6 team grid: 4 cols -> 1 col.
- C7 portfolio: already stacks single-column on desktop; no change.
- C11 form: Submit block moves below the Message field, full-width.
- C12 footer: columns stack; CTA moves below headline.

## States to be designed during build phase

Hover / focus / active / disabled states are not capturable from static screenshots. Build phase will derive them from the token palette using these rules:
- Pill CTA hover: scale 1.04, no colour change, 200ms ease-out.
- Pill CTA active: scale 0.98, 100ms.
- Pill CTA focus visible: 2px mint outline offset 2px (use coral instead when the pill itself is mint).
- Form field focus: 2px mint outline, no fill change.
- Link hover (footer + nav menu items): underline appears, 1px, currentColor.
- Disabled: 0.5 opacity, no pointer events.
