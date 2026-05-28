# Components decided

Clone mode: every component in `components-observed.md` is **ADOPT** as-is. This file is the locked instruction set the Astro build phase composes from. If the build phase needs anything not described here, the deviation goes in `decisions.md` first.

## C1. Header / Nav

**Decision:** ADOPT
**Astro path:** `src/components/Header.astro`
**Build instruction:**
- Render as a `<header>` with class `bg-[var(--color-page-bg)] text-white sticky top-0 z-50`.
- Three-column flex: logo left, menu trigger centred, CTA right.
- Mobile-first; same arrangement at all breakpoints, type scale only.
- Menu trigger opens a full-screen overlay (build phase to design from the dotted-ring atom in C13). Overlay contents: link list (Our Work / About / Contact) at large Butler scale, social icons, secondary CTA.

## C2. Hero (home)

**Decision:** ADOPT
**Astro path:** `src/components/HomeHero.astro`
**Build instruction:**
- Two-column grid `md:grid-cols-12` with copy in `md:col-span-6` left, collage in `md:col-span-6` right.
- Photo collage: 7 to 8 image tiles, absolute positioned with rotations between -6deg and +6deg; bleed off the right edge via negative `mr` on the wrapper.
- On load: stagger tiles 80ms apart, 600ms ease-out, slide from offset y/x of 24-48px to final position. Use Astro view transitions or a small inline Intersection-Observer + CSS keyframe.
- Tile shapes: rounded `rounded-card-md` (20px).
- Copy structure: Starlit signature -> Butler headline -> Mulish body -> two pill CTAs (C1-style, repeated).

## C3. Client logo bar

**Decision:** ADOPT
**Astro path:** `src/components/LogoBar.astro`
**Build instruction:**
- Single-row flex on desktop, wrap on mobile.
- Logo SVGs forced to `fill-current text-[var(--color-text-on-dark-muted)]` so colour is uniform.
- Source SVGs from `_source/mirror/wp-content/uploads/**` and copy into `public/clients/`.

## C4. Section signature atom

**Decision:** ADOPT
**Astro path:** `src/components/Signature.astro` (props: `text`, `colour="coral"|"mint"`)
**Build instruction:**
- Renders a `<span>` with `font-script text-script-eyebrow text-coral` (or mint) and a slight `rotate(-2deg)` for the handwritten feel.
- No background, no border, no decoration.

## C5. Services block

**Decision:** ADOPT
**Astro path:** `src/components/ServicesPanel.astro`
**Build instruction:**
- Light panel: `bg-stone-100 text-navy-700 rounded-card-lg p-12 md:p-16 mx-6 md:mx-12`.
- Heading: single-line Butler with inline Starlit Drive `and more,` at the end in coral.
- Body: `md:grid-cols-3` columns with vertical lists, no icons.
- Last column on tablet drops to two-column 2x2.

## C6. Team photo grid

**Decision:** ADOPT
**Astro path:** `src/components/TeamGrid.astro`
**Build instruction:**
- Drive from a content collection `src/content/team/*.md` with frontmatter `name`, `role`, `image`.
- Tailwind grid `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6`.
- Cell: image at `aspect-[5/6] grayscale rounded-card-md`, name 600 white below, role muted below name.
- Apply `grayscale` via Tailwind utility on the image, do NOT pre-process B&W into the file (preserves the colour original for future use).

## C7. Portfolio grid (index)

**Decision:** ADOPT
**Astro path:** `src/components/PortfolioGrid.astro`
**Build instruction:**
- Drive from content collection `src/content/portfolio/*.md` with frontmatter `name`, `slug`, `heroImage`, `summary`.
- Layout: single vertical column of cards, gap-6, each card `aspect-[16/10]` desktop / `aspect-[4/5]` mobile, `rounded-card-lg overflow-hidden`.
- Card content: hero image full-bleed, brand wordmark/logo overlaid centred.
- Hover: scale-[1.02] over 200ms, shadow lift.

## C8. Portfolio detail — numbered case sections

**Decision:** ADOPT
**Astro path:** `src/components/CaseSection.astro` (props: `number`, `heading`, slot for body)
**Build instruction:**
- Two-column grid `md:grid-cols-12`.
- Left col span 3-4: big Butler numeral `text-display-xxl text-white leading-none`, then a `w-6 h-[3px] bg-mint mt-2` underline.
- Right col span 8-9: Butler heading + Mulish body slot.
- Stacking: numeral on top, body below, on mobile.

## C9. Hero — Portfolio detail

**Decision:** ADOPT
**Astro path:** `src/components/PortfolioDetailHero.astro`
**Build instruction:**
- Centred Butler treatment of the brand name (allow per-case override via frontmatter `wordmark`: text or image).
- Background: photo collage similar to C2 but tighter density (4-5 tiles).
- Coral Starlit Drive tagline below, drawn from frontmatter `tagline`.

## C10. Quote / pull-quote panel

**Decision:** ADOPT
**Astro path:** `src/components/PullQuote.astro` (props: `quote`, `attribution`, `image?`)
**Build instruction:**
- Two-col `md:grid-cols-12` with image (optional) span 5 left and quote span 7 right.
- Quote: Butler `text-heading-lg leading-tight text-white`.
- Attribution: Starlit Drive coral below quote.

## C11. Form

**Decision:** ADOPT
**Astro path:** `src/components/ContactForm.astro`
**Build instruction:**
- POST to a server endpoint at `src/pages/api/contact.ts` (SSR project, this is fine).
- Anti-spam: Cloudflare Turnstile (matches the Arro pattern).
- Fields: name, email, subject, message. All required server-side. Disable `auto-reply` kill switch pattern via env (cf. `feedback_resend_marketing_via_emails_send_violates_aup` and `project_arro_spam_hardening` for transactional vs marketing rules).
- Field styling per C11 in observed.
- Submit: render as a sibling block to the field stack on desktop, full-width below on mobile. Use a CSS grid `grid-cols-12` parent and assign the submit block `col-span-4 row-span-3` on `md+`.
- Send via nodemailer/SMTP if Rooftop has SMTP credentials, otherwise Resend transactional. Confirm with Connor at form-wiring time.

## C12. Universal footer (`Let's chat.` + columns + legal)

**Decision:** ADOPT
**Astro path:** `src/components/SiteFooter.astro`
**Build instruction:**
- Lives inside `Layout.astro` and renders on every page.
- Top half: `Let's chat.` Butler headline + mint pill CTA right-aligned on desktop, stacked left-aligned on mobile.
- Columns block below: 3 columns of content + 1 empty column on desktop (preserves the rhythm seen in screenshots), stack on mobile.
- Legal strip: 12px muted text.

## C13. PRESS TO TALK rotating ring

**Decision:** ADOPT
**Astro path:** `src/components/PressToTalkRing.astro` (variants: `menu-trigger` and `pointer`)
**Build instruction:**
- SVG with text-on-path running `PRESS TO TALK · ` around the circumference.
- Continuous rotation `12s linear infinite`.
- `menu-trigger` variant: render a small hamburger glyph (three short stacked lines) inside, used in the header.
- `pointer` variant: render a downward chevron inside, used on `/contact/`.

## C14. 404

**Decision:** ADOPT
**Astro path:** `src/pages/404.astro`
**Build instruction:**
- White hero panel with navy text `The page can't be found.`.
- Coral CTA top-right matching nav CTA position.
- Universal footer below.

## Site map (build order)

1. `Layout.astro` + `Header` + `SiteFooter` (touches every page).
2. `/index.astro` (home).
3. `/about.astro`.
4. `/portfolio/index.astro`.
5. `/portfolio/[slug].astro` driven by collection.
6. `/contact.astro` + `api/contact.ts`.
7. `/terms-conditions.astro`.
8. `404.astro`.

## States (recap)

- Pill CTA hover: scale 1.04, 200ms ease-out.
- Pill CTA active: scale 0.98, 100ms.
- Focus visible: 2px mint outline, offset 2px. On mint pills use coral outline.
- Form field focus: 2px mint outline, no fill change.
- Footer / nav link hover: 1px underline currentColor.
- Disabled: opacity 0.5, no pointer events.
