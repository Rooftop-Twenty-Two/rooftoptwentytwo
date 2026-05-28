# Design extract inputs

Project: Rooftop Twenty Two (rooftoptwentytwo.ie) rebuild
Run mode: **clone-mode variant** (see decisions.md for rationale)
Date: 2026-05-28

## Inputs received

1. **Current site, desktop + mobile + tablet screenshots**
   Captured by Playwright at three breakpoints (1440 / 768 / 390) for all 43 URLs.
   Location: `_source/screenshots/{desktop,tablet,mobile}/*.png` (129 PNGs total).
   Scroll-before-shot ran reveal animations before each capture.

2. **Current site code access**
   wget mirror of full site (HTML, CSS, JS, fonts, images) at `_source/mirror/`.
   86MB, 38 HTML pages, 213 PNG, 125 JPG, 29 SVG, 55 CSS, 3 webfonts (.woff/.woff2 for Butler + Starlit Drive).
   Playwright computed-style dumps for five key templates at `_source/styles/`.
   Motion videos for home and one portfolio detail at `_source/videos/`.

3. **Reference sites**
   **Not applicable.** This is a pixel-perfect clone, not a redesign. The current site IS the reference. Phases 2 / 3 / 4 of the standard pipeline are short-circuited (see decisions.md).

4. **Project metadata**
   - Vertical: digital creative agency (Irish independent studio)
   - Audience: Irish SMEs and not-for-profits commissioning brand, web, and digital marketing work
   - Primary conversion goal: form submission on `/contact/` (with "Let's Chat" header CTA driving to the same page)
   - Secondary goal: portfolio engagement (case-study reads as social proof)

5. **Brand non-negotiables (implicit from clone scope)**
   - Logo: Rooftop wordmark + "TWENTY TWO" stack (existing SVG, ported as-is)
   - Palette: navy `#0D2030`, coral `#E15047`, mint `#00FFB2`, text navy `#143A4F` (extracted from Elementor kit `post-9.css`)
   - Type: Butler (display serif), Starlit Drive (script accent), Mulish variable (body sans)
   - Registered name (footer legal): "Rooftop Twenty Two. 2026. All rights reserved."

6. **Negatives**
   None received explicitly. Inferred from clone scope: no introduction of new aesthetic elements, AI tells, or Elementor cruft. Anything outside the existing component vocabulary requires an explicit decision logged.
