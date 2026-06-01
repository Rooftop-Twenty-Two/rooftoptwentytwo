import { config, collection, fields } from "@keystatic/core";

// Keystatic CMS config. Gives the team a visual editor at /keystatic that reads
// and writes the SAME markdown files Astro already uses (src/content/*), then
// commits to the repo so Vercel redeploys. No separate database.
//
// Field names here mirror src/content.config.ts exactly so nothing breaks.
// Images are stored under public/images/<collection>/ and referenced by path.

const faq = fields.array(
  fields.object({
    question: fields.text({ label: "Question" }),
    answer: fields.text({ label: "Answer", multiline: true }),
  }),
  { label: "FAQ", itemLabel: (p) => p.fields.question.value || "Question" }
);

export default config({
  // Keystatic Cloud storage: editors sign in with email/Google (no GitHub
  // account needed); Keystatic Cloud commits their edits to this repo on its
  // side, which triggers a Vercel redeploy. No env vars required.
  //
  // SETUP: create a team + project at https://keystatic.cloud, connect this
  // GitHub repo, then set the slug below to "<team>/<project>" exactly as shown
  // in the Keystatic Cloud dashboard. The placeholder below WILL NOT work until
  // it matches a real project.
  storage: { kind: "cloud" },
  cloud: { project: "rooftop-twenty-two/website" },

  ui: {
    brand: { name: "Rooftop Twenty Two" },
    navigation: {
      "Content": ["portfolio", "articles", "team", "jobs"],
      "Pages": ["services", "sectors"],
    },
  },

  collections: {
    // ---- Case studies -------------------------------------------------------
    portfolio: collection({
      label: "Case studies",
      slugField: "name",
      path: "src/content/portfolio/*",
      format: { data: "yaml" },
      columns: ["name", "tagline"],
      schema: {
        name: fields.slug({ name: { label: "Client name" } }),
        tagline: fields.text({ label: "Tagline" }),
        summary: fields.text({ label: "Summary (intro paragraph)", multiline: true }),
        metaDescription: fields.text({ label: "Meta description (SEO, ≤160 chars)", multiline: true }),
        heroImage: fields.image({
          label: "Hero image",
          directory: "public/images/portfolio",
          publicPath: "/images/portfolio/",
        }),
        websiteUrl: fields.url({ label: "Live website URL (optional)" }),
        order: fields.integer({ label: "Sort order (lower = first)", defaultValue: 100 }),
        featured: fields.checkbox({ label: "Featured", defaultValue: false }),
        services: fields.array(fields.text({ label: "Service" }), {
          label: "Services", itemLabel: (p) => p.value,
        }),
        sections: fields.array(
          fields.object({
            number: fields.text({ label: "Number (e.g. 01)" }),
            heading: fields.text({ label: "Heading" }),
            body: fields.text({ label: "Body", multiline: true }),
            bullets: fields.array(fields.text({ label: "Bullet" }), { label: "Bullets", itemLabel: (p) => p.value }),
            groups: fields.array(
              fields.object({
                label: fields.text({ label: "Sub-heading" }),
                items: fields.array(fields.text({ label: "Item" }), { label: "Items", itemLabel: (p) => p.value }),
              }),
              { label: "Sub-headed bullet groups", itemLabel: (p) => p.fields.label.value || "Group" }
            ),
          }),
          { label: "Sections (Challenge / Strategy / Impact)", itemLabel: (p) => p.fields.heading.value || "Section" }
        ),
        gallery: fields.array(
          fields.image({ label: "Image", directory: "public/images/portfolio", publicPath: "/images/portfolio/" }),
          { label: "Gallery", itemLabel: () => "Image" }
        ),
        // Headline results — shown as an animated stat band + before/after bars
        // near the top of the case study. Only add numbers you can stand over.
        results: fields.object(
          {
            intro: fields.text({ label: "Intro line (optional)", multiline: true }),
            stats: fields.array(
              fields.object({
                to: fields.number({ label: "Number (e.g. 1000, 1.28, 68)" }),
                prefix: fields.text({ label: "Prefix (e.g. €)" }),
                suffix: fields.text({ label: "Suffix (e.g. %, +, ×)" }),
                decimals: fields.integer({ label: "Decimal places", defaultValue: 0 }),
                label: fields.text({ label: "Label" }),
              }),
              { label: "Stats (counters)", itemLabel: (p) => p.fields.label.value || "Stat" }
            ),
            bars: fields.array(
              fields.object({
                label: fields.text({ label: "Bar title" }),
                before: fields.number({ label: "Before value" }),
                after: fields.number({ label: "After value" }),
                beforeLabel: fields.text({ label: "Before label (e.g. Benchmark)" }),
                afterLabel: fields.text({ label: "After label (e.g. client name)" }),
                suffix: fields.text({ label: "Suffix (e.g. %, ×)" }),
              }),
              { label: "Before/after bars", itemLabel: (p) => p.fields.label.value || "Bar" }
            ),
          },
          { label: "Results" }
        ),
      },
    }),

    // ---- Insights / articles ------------------------------------------------
    articles: collection({
      label: "Insights (articles)",
      slugField: "title",
      path: "src/content/articles/*",
      format: { data: "yaml" },
      columns: ["title", "publishedAt"],
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        excerpt: fields.text({ label: "Excerpt", multiline: true }),
        metaDescription: fields.text({ label: "Meta description (SEO)", multiline: true }),
        author: fields.text({ label: "Author", defaultValue: "Rooftop Twenty Two" }),
        publishedAt: fields.date({ label: "Published date" }),
        heroImage: fields.image({ label: "Hero image", directory: "public/images/latest", publicPath: "/images/latest/" }),
        tags: fields.array(fields.text({ label: "Tag" }), { label: "Tags", itemLabel: (p) => p.value }),
        draft: fields.checkbox({ label: "Draft (hide from site)", defaultValue: false }),
      },
    }),

    // ---- Team ---------------------------------------------------------------
    team: collection({
      label: "Team",
      slugField: "name",
      path: "src/content/team/*",
      format: { data: "yaml" },
      columns: ["name", "role"],
      schema: {
        name: fields.slug({ name: { label: "First name" } }),
        role: fields.text({ label: "Role" }),
        portrait: fields.image({ label: "Portrait", directory: "public/images/team", publicPath: "/images/team/" }),
        order: fields.integer({ label: "Sort order (lower = first)", defaultValue: 100 }),
      },
    }),

    // ---- Jobs ---------------------------------------------------------------
    jobs: collection({
      label: "Open roles",
      slugField: "title",
      path: "src/content/jobs/*",
      format: { data: "yaml" },
      columns: ["title", "location"],
      schema: {
        title: fields.slug({ name: { label: "Job title" } }),
        summary: fields.text({ label: "Summary", multiline: true }),
        type: fields.text({ label: "Type", defaultValue: "Full-time" }),
        location: fields.text({ label: "Location", defaultValue: "Dublin · Hybrid" }),
        order: fields.integer({ label: "Sort order", defaultValue: 100 }),
        intro: fields.text({ label: "Intro paragraph", multiline: true }),
        responsibilities: fields.array(fields.text({ label: "Item" }), { label: "What you'll do", itemLabel: (p) => p.value }),
        requirements: fields.array(fields.text({ label: "Item" }), { label: "What you'll bring", itemLabel: (p) => p.value }),
        niceToHave: fields.array(fields.text({ label: "Item" }), { label: "Nice to have", itemLabel: (p) => p.value }),
        draft: fields.checkbox({ label: "Draft (hide from site)", defaultValue: false }),
      },
    }),

    // ---- Services (advanced; edit with care) --------------------------------
    services: collection({
      label: "Services",
      slugField: "name",
      path: "src/content/services/*",
      format: { data: "yaml" },
      columns: ["name"],
      schema: {
        name: fields.slug({ name: { label: "Name" } }),
        cluster: fields.text({ label: "Cluster (performance-marketing / creative-and-content / web)" }),
        isClusterParent: fields.checkbox({ label: "Is cluster parent", defaultValue: false }),
        summary: fields.text({ label: "Summary", multiline: true }),
        metaDescription: fields.text({ label: "Meta description", multiline: true }),
        heroEyebrow: fields.text({ label: "Hero eyebrow" }),
        heroHeading: fields.text({ label: "Hero heading" }),
        heroBody: fields.text({ label: "Hero body", multiline: true }),
        whatItIs: fields.text({ label: "What it is", multiline: true }),
        whatsIncluded: fields.array(fields.text({ label: "Item" }), { label: "What's included", itemLabel: (p) => p.value }),
        caseStudySlugs: fields.array(fields.text({ label: "Case study slug" }), { label: "Featured case studies", itemLabel: (p) => p.value }),
        faq,
        order: fields.integer({ label: "Sort order", defaultValue: 100 }),
      },
    }),

    // ---- Sectors (advanced; edit with care) ---------------------------------
    sectors: collection({
      label: "Sectors",
      slugField: "name",
      path: "src/content/sectors/*",
      format: { data: "yaml" },
      columns: ["name"],
      schema: {
        name: fields.slug({ name: { label: "Name" } }),
        summary: fields.text({ label: "Summary", multiline: true }),
        metaDescription: fields.text({ label: "Meta description", multiline: true }),
        heroEyebrow: fields.text({ label: "Hero eyebrow" }),
        heroHeading: fields.text({ label: "Hero heading" }),
        heroBody: fields.text({ label: "Hero body", multiline: true }),
        challenges: fields.array(fields.text({ label: "Challenge" }), { label: "Common challenges", itemLabel: (p) => p.value }),
        pointOfView: fields.text({ label: "Our point of view", multiline: true }),
        caseStudySlugs: fields.array(fields.text({ label: "Case study slug" }), { label: "Featured case studies", itemLabel: (p) => p.value }),
        faq,
        order: fields.integer({ label: "Sort order", defaultValue: 100 }),
      },
    }),
  },
});
