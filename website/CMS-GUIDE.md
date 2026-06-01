# Editing the website (Keystatic CMS)

The team can update site content through a visual editor. No code, no markdown.

## Where
Go to **`https://rooftoptwentytwo.ie/keystatic`** (or the current deploy URL +
`/keystatic`). Sign in with **GitHub** the first time — you need write access to
the `Rooftop-Twenty-Two/rooftoptwentytwo` repo (ask Cathal to add you).

## What you can edit
- **Case studies** — client name, tagline, summary, hero image, services, and
  the Challenge / Strategy / Impact sections (with bullet groups).
- **Insights (articles)** — title, excerpt, hero image, tags, published date.
  Tick **Draft** to hide one while you work on it.
- **Team** — name, role, portrait, sort order.
- **Open roles** — job specs for the Careers page. Tick **Draft** to hide.
- **Services** and **Sectors** — advanced (hero copy, what's included, FAQs,
  which case studies feature). Edit with care.

## How it works (important)
- When you **Save**, Keystatic commits the change to GitHub, which triggers an
  automatic deploy on Vercel. **Your edit goes live in ~1–2 minutes** (the time
  it takes to rebuild), not instantly.
- Images you upload go into the right `public/images/...` folder automatically.
- **Sort order:** lower number = appears first.

## Tips
- Keep meta descriptions under ~160 characters.
- Follow the brand voice (see `docs/content-style-guide.md`): plain, warm, no em
  dashes, Irish spelling, real numbers over adjectives.
- If something looks wrong after publishing, tell a developer — every change is
  in the Git history and can be rolled back.

## For developers
- Config: `website/keystatic.config.ts` (field names mirror
  `src/content.config.ts`).
- Local editing without GitHub: temporarily set `storage: { kind: "local" }` in
  the config and run `npm run dev`, then open `/keystatic`.
