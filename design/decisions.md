# Decisions log (append-only)

## 2026-05-28, run mode: clone

**Decision:** Skip Phases 2 / 3 / 4 of the standard `/design-extract` pipeline (reference scoring, multi-reference triage, anti-AI-tell guardrail).

**Why:** The brief is a pixel-perfect clone of an existing live site, not a fresh design. Reference scoring and triage exist to prevent aesthetic drift toward AI defaults when composing from multiple sources. There is one source here (rooftoptwentytwo.ie) and the contract is to mirror it. Averaging or re-triaging would introduce drift, the opposite of the brief.

**Effect on outputs:**
- `inputs.md`: documents that reference screenshots are not applicable.
- `current-site/reconciliation.md`: present as in the standard pipeline.
- `brand-tokens.json`: extracted from the current site only, not aggregated across references.
- `components-observed.md`: catalogues every distinct block on the source.
- `components-decided.md`: every entry is ADOPT; no triage column.
- `direction.md`: drops the "which references win" section.

**Effect on later work:** When new vertical or service pages are added in a follow-up phase, this contract is already expressive enough to compose them. If a new page requires a component not in the current vocabulary, that addition gets its own dated entry in this file before being introduced.

## 2026-05-28, scope adjustment

**Decision:** No individual `/team/<slug>/` templates.

**Why:** Every team URL listed in `team-sitemap.xml` returns 404 on the live site (verified by Playwright capture, see `_source/screenshots/desktop/team__johnny.png` and siblings). Team profiles only live as cards within `/about/`.

**Effect:** Build phase task list reduced by one route. Sitemap for the rebuild omits `/team/` URLs entirely.

## 2026-05-28, fonts

**Decision:** Self-host Butler, Starlit Drive, and Mulish.

**Why:** Butler and Starlit Drive are already self-hosted on the source site (the .woff/.woff2 files live in `_source/mirror/wp-content/uploads/2023/10/`); no licence work needed to keep them self-hosted. Mulish is the body sans, available on Google Fonts as a variable font; self-hosting it standardises the loading model (single `@font-face` block, no third-party request) and matches Connor's general preference on MAP-built sites.

**Effect:** Build phase copies the three font families into `public/fonts/` and defines them in a single `globals.css` `@font-face` set.

## 2026-05-28, photography treatment

**Decision:** Apply `grayscale` via Tailwind utility on the team grid only. Do not pre-process B&W into image files.

**Why:** Connor's standing rule (`feedback_keep_photos_in_colour`) is that photography stays in colour unless the treatment is deliberate. The team grid B&W is deliberate; everything else is colour. Applying greyscale at the CSS layer keeps the colour originals available if a future treatment changes.

**Effect:** Image library in `_source/mirror/wp-content/uploads/**` is copied to `public/images/` untouched. The team grid component applies `grayscale` at render time.
