# Current-site reconciliation

Two passes were run on the source: a **perceived** pass (Vision over the 1440 / 768 / 390 PNG captures) and a **computed** pass (Elementor kit CSS at `_source/mirror/wp-content/uploads/elementor/css/post-9.css` plus the JSON dumps at `_source/styles/*.json`). The two are in close agreement; where they diverged, computed wins because it carries hex precision the eye cannot give.

## Palette

| Token | Perceived | Computed | Verdict |
|-------|-----------|----------|---------|
| Page background | very dark navy | `#0D2030` | computed |
| Body text | softer navy on dark | `#143A4F` rendered light on dark via colour pair, plus `#FFFFFF` on dark in headlines | computed; both used per role |
| Script accent (handwritten signatures) | warm coral | `#E15047` | computed |
| Primary CTA fill | vivid mint / teal-green | `#00FFB2` | computed (verified on Submit button + nav "Let's Chat" pill) |
| Secondary surface | warm off-white | `#ECE8E7` | computed (used on Services panel on home) |
| Tertiary teal | deep teal | `#225C5E` | computed (sparse, used on accent strokes) |
| Pale teal | low-sat blue-green | `#C2DDDB` | computed (background washes) |
| Cool off-white | near-white | `#ECEDEE` | computed |
| Stone white | clean white | `#F9F9F9` | computed (panel backgrounds) |
| Muted blue-grey | desaturated periwinkle | `#6A6F97` | computed (low-emphasis text on light surfaces) |
| Wine | dark plum | `#78233C` | computed (currently unused in visible templates; legacy palette slot) |

WCAG AA check:
- Body white `#FFFFFF` on navy `#0D2030`: contrast ratio ~16:1. Pass.
- Mint `#00FFB2` on navy `#0D2030`: contrast ratio ~12:1. Pass.
- Coral `#E15047` on navy `#0D2030`: contrast ratio ~5.4:1. Pass for normal body, pass for large text.
- Text navy `#143A4F` on stone white `#F9F9F9`: contrast ratio ~11:1. Pass.

No palette adjustments required.

## Type

| Token | Perceived | Computed | Verdict |
|-------|-----------|----------|---------|
| Display | high-contrast modern serif | `Butler` (.woff/.woff2 self-hosted at `wp-content/uploads/2023/10/`) | matches |
| Accent script | hand-drawn brush script | `Starlit Drive` (.woff/.woff2 self-hosted, same upload folder) | matches |
| Body | clean variable sans | `mulish-variable` (also written `'Muli', Sans-Serif` in some declarations) | matches; rebuild standardises on Mulish variable from Google Fonts or self-hosted |

Type scale (extracted from headline observation, to be calibrated in Tailwind at build time):
- Display H1 (e.g. `Let's chat.` block): ~144px / 9rem desktop, ~64px / 4rem mobile
- Display H2 (e.g. `Our Work`, `Team` signature plus following Butler line): ~80px / 5rem desktop
- Section H3: ~48px / 3rem
- Body large (hero intro): 22-24px
- Body: 18px desktop, 16px mobile
- Eyebrow / signature (Starlit Drive): ~48px / 3rem

## Spacing

Section padding observed at ~96-128px top/bottom on desktop, ~64-80px on mobile. No explicit 8px scale enforced by Elementor; rebuild adopts an 8px scale (8/16/24/32/48/64/96/128) for consistency.

## Composition

- Universal dark navy canvas with light type.
- Asymmetric sections: copy left-aligned, decorative or photo content right.
- Photographic collages used on hero blocks (home, about, portfolio detail).
- Black-and-white portrait treatment is intentional and used only on the team grid in `/about/`; portfolio detail keeps photography in colour (cross-reference Connor's standing rule that photography stays in colour unless deliberately treated).

## Motion (from `_source/videos/home/*.webm` + `_source/videos/portfolio__the-1933-furniture-company/*.webm`)

- Hero collage assembles on load: photo tiles slide in from offset positions over ~600ms ease-out.
- Section reveals on scroll: subtle fade-up (~200ms) as each block enters viewport.
- Pill CTAs scale to ~1.04 on hover with a 200ms ease-out (mint fill stays solid).
- The "PRESS TO TALK" circular dotted ring (also used as nav menu trigger) rotates slowly and continuously.
- No bounce easing observed; reveals use ease-out only.

## Source-of-truth files for build phase

- Palette + type definitions: `_source/mirror/wp-content/uploads/elementor/css/post-9.css`
- Webfont files to vendor into Astro public: `_source/mirror/wp-content/uploads/2023/10/butler_bold-webfont.{woff,woff2}` and `starlit_drive-webfont.{woff,woff2}`
- Image library: `_source/mirror/wp-content/uploads/**` (preserve original filenames where possible)
- Computed-style references: `_source/styles/{home,about,contact,portfolio,portfolio__the-1933-furniture-company}.json`
