# Direction (human-readable contract)

One-page summary for Connor to sanity-check before the build phase starts.

## What we are building

A pixel-perfect rebuild of `rooftoptwentytwo.ie` in Astro SSR + Tailwind v4, replacing the existing WordPress + Elementor stack. Same content, same look, same feel. Stack will become Connor's standard `~/Code/client-projects/...` shape, ready to host new vertical and service pages later without re-extracting design tokens.

## Aesthetic in two sentences

A dark-navy magazine with three voices. Butler serif carries the weight (`Let's chat.`, case numerals, headlines), Starlit Drive script carries the personality (handwritten section signatures), and Mulish carries the body, with coral and electric mint pulling the eye to the small things that matter.

## Tokens (locked)

- **Background:** navy `#0D2030`
- **Text on dark:** white `#FFFFFF`, with `#C2DDDB` for muted secondary
- **Text on light:** navy `#143A4F`
- **Signature accent:** coral `#E15047` (also the header CTA fill)
- **Primary CTA fill:** mint `#00FFB2` (with navy label)
- **Light panels:** stone `#F9F9F9` and warm `#ECE8E7`
- **Display:** Butler bold (self-hosted)
- **Script:** Starlit Drive (self-hosted)
- **Body:** Mulish variable
- **Radii:** pill `9999px`, large card `32px`, input `16px`
- **Motion:** 200/400/600ms ease-out, no bounce, no spring

## Components (locked)

14 components catalogued, all marked ADOPT. See `components-decided.md` for the build instructions tied to each. Highlights:
- `Signature` atom (Starlit script in coral or mint) is the recurring section eyebrow.
- `CaseSection` is the numbered `01`-`05` block that drives every portfolio detail page.
- `PressToTalkRing` is the rotating dotted ring used as nav trigger and contact pointer.
- `SiteFooter` carries the universal `Let's chat.` block and renders on every page from `Layout.astro`.

## Routes (build scope)

1. `/` home
2. `/about/`
3. `/portfolio/` index (single-column card stack)
4. `/portfolio/[slug]/` detail (driven by content collection, 27 entries to migrate)
5. `/contact/` (form posts to `api/contact.ts`)
6. `/terms-conditions/`
7. `/404`

The source-site `team-sitemap.xml` lists 11 `/team/<slug>/` URLs but they all return "The page can't be found" on the live site. Treat them as deleted; no team detail templates are built. Team profiles live as cards inside `/about/`.

## What is NOT in this contract

- Hover, focus, active, and disabled states are not visible in static screenshots. Rules are codified in `components-decided.md` and `brand-tokens.json`. Build phase derives the states from those rules.
- Form-submission backend (SMTP vs Resend, anti-spam stack) is left for the build phase to confirm with Connor.
- New vertical or service landing pages. Out of scope for this rebuild pass. Future work composes from the locked component vocabulary here.

## Open questions for Connor

1. **Form delivery:** Rooftop SMTP credentials available, or should the form route through Resend transactional? (Connor's standing rule: marketing via Audiences, transactional via emails.send is fine.)
2. **Contact destination email:** confirm `hey@rooftoptwentytwo.ie` is still the right inbox.
3. **Cloudflare Turnstile:** OK to add as the spam guard, mirroring Arro hardening?
4. **Content migration:** I plan to scrape the 27 portfolio detail bodies (title + section copy + image refs) into MDX in `src/content/portfolio/`. Sound right, or do you want to wait until after the templates render against placeholder content?
5. **Hosting:** Dokploy on Hetzner (matches CGR, Dr Rhead, etc.) or somewhere else for this client?
