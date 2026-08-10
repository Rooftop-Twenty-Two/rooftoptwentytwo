# New Website Brief — form spec (as built)

The "Website Discovery & Requirements Form", as built in JotForm and mirrored on
the site at `/website-brief/` (`website/src/pages/website-brief.astro`).

- **JotForm ID:** `262212815673052`
- **Submit endpoint (EU):** `https://eu-submit.jotform.com/submit/262212815673052`
- **Thank-you redirect:** the on-site form sends visitors to
  `https://rooftoptwentytwo.ie/thank-you/` after a successful post.

The on-site form posts to JotForm with the exact same field `name`s, option
`value`s and required flags, so a submission from the website matches one made on
JotForm. **If you change the JotForm form, mirror it in the Astro page** (and
here). Field names follow JotForm's `q{n}_q{n}_{type}{k}` pattern and must be
copied verbatim.

## Field map

| Section / question | JotForm field name | Type | Required |
|---|---|---|---|
| **01 Your details** | | | |
| First name | `q3_q3_textbox1` | text | Yes |
| Last name | `q4_q4_textbox2` | text | Yes |
| Phone number | `q5_q5_phone3[full]` | phone | Yes |
| Email address | `q6_q6_email4` | email | Yes |
| Company name | `q7_q7_textbox5` | text | Yes |
| Current website domain | `q8_q8_textbox6` | text | No |
| Brand-new or rebuild/redesign? | `q9_q9_radio7` | radio | Yes |
| **02 About your business** | | | |
| Business summary | `q11_q11_textarea9` | textarea | Yes |
| Market position | `q12_q12_textarea10` | textarea | No |
| Main competitors | `q13_q13_textarea11` | textarea | No |
| Target audiences | `q14_q14_textarea12` | textarea | Yes |
| Commercial objectives | `q15_q15_textarea13` | textarea | Yes |
| Success in 12 months | `q16_q16_textarea14` | textarea | Yes |
| **03 Brand and content** | | | |
| Brand assets | `q18_q18_checkbox16[]` | checkbox | No |
| What must the website do? | `q19_q19_checkbox17[]` | checkbox | No |
| R22 writing copy | `q20_q20_radio18` | radio | Yes |
| **04 Your current website** | | | |
| Likes | `q22_q22_textarea20` | textarea | No |
| Frustrations | `q23_q23_textarea21` | textarea | No |
| Websites you like | `q24_q24_textbox22` | text | No |
| How it should feel | `q25_q25_textbox23` | text | No |
| Websites/brands disliked | `q26_q26_textarea24` | textarea | No |
| **05 Technical and platform** | | | |
| Current platform | `q28_q28_radio26` | radio | Yes |
| Current hosting | `q29_q29_textbox27` | text | No |
| Domain / DNS control | `q30_q30_radio28` | radio | Yes |
| Platform preference | `q31_q31_radio29` | radio | Yes |
| Tools to connect to | `q32_q32_checkbox30[]` (+ `[other]`) | checkbox | No |
| **06 Scope and services** | | | |
| How promoted | `q34_q34_checkbox32[]` (+ `[other]`) | checkbox | Yes (min 1) |
| Other promotion details | `q35_q35_textbox33` | text | No |
| Page count | `q36_q36_radio34` | radio | Yes |
| Added services | `q37_q37_checkbox35[]` | checkbox | No |
| Website functionality | `q38_q38_checkbox36[]` | checkbox | No |
| Ongoing help | `q39_q39_checkbox37[]` | checkbox | No |
| Accessibility / compliance | `q40_q40_radio38` | radio | Yes |
| Accessibility details | `q41_q41_textarea39` | textarea | No |
| **07 Commercials** | | | |
| Budget | `q43_q43_radio41` | radio | Yes |
| Required delivery date | `q44_q44_datetime42[month\|day\|year]` | date | Yes |
| Additional information | `q45_q45_textarea43` | textarea | No |

Hidden/required system fields: `formID` = `262212815673052`, `simple_spc` =
`262212815673052-262212815673052`, and the honeypot `website` (must stay empty).

## Option values (verbatim)

**Brand-new or rebuild (`q9`):** Brand-new website · Rebuild/redesign of current site · Not sure yet

**Brand assets (`q18`):** High-resolution logos · High-res imagery · Video · Brand guidelines · Tone-of-voice guidelines · Social media profiles

**What must the website do? (`q19`):** Generate leads · Capture enquiries (enquiry forms) · Take bookings / show a calendar · Publish blog and news updates · Update with new products, listings or services · Offer a brochure download · Sell online (ecommerce)

**R22 writing copy (`q20`):** Happy for R22 to write all copy (we'll review and amend it) · We'll supply some copy ourselves, R22 to write the rest · We'll supply all copy ourselves · Not sure yet

**Current platform (`q28`):** Custom build · WordPress · Shopify · Don't know · Not applicable (no current site)
(On the site, Custom build is listed first with a short note — "Our recommendation. Greater flexibility and control." — to steer gently towards it. The submitted value stays "Custom build".)

**Domain / DNS control (`q30`):** We do, and we have access · Our previous developer / agency · Not sure

**Platform preference (`q31`):** Keep our current platform · Happy to move to whatever R22 recommends · We have a specific platform in mind (please tell us)

**Tools to connect to (`q32`):** Email marketing (Mailchimp, HubSpot, etc.) · CRM · Booking / scheduling system · Payment gateway · Analytics (GA4, etc.) · Other

**How promoted (`q34`):** Search engines (SEO) · Pay per click · Email · Social · Paid social · Offline (radio, TV, print) · Events · Other

**Page count (`q36`):** 1–5 · 5–10 · 10–20 · 20–50 · 50–100

**Added services (`q37`):** Logo / brand identity · Illustrations · Photography · Video production

**Website functionality (`q38`):** About us page · Enquiry forms · Blog / news · Image gallery · Newsletter signup · Document downloads · Data capture · Maps · Product catalogue (non-ecommerce) · Ecommerce · Integration with a third-party booking system · Live chat

**Ongoing help (`q39`):** Training to use the website · Performance and monitoring · Backups · Ongoing marketing · Ongoing development · Service level agreement · Compliance measures

**Accessibility / compliance (`q40`):** Yes (please tell us) · No · Not sure — we'd like R22's guidance

**Budget (`q43`):** €5–15k · €15–25k · €25k+

## Notes

- The native date picker on the page is split into JotForm's month/day/year
  sub-fields on submit.
- "How promoted" (`q34`) is validated as at-least-one on the page, matching
  JotForm's required setting.
- The JotForm phone field uses a `(000) 000-0000` mask; the on-site field is a
  plain `tel` input so it accepts Irish/international formats.
