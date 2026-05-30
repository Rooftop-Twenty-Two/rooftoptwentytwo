import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "zod";

const faqItemSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

const portfolio = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/portfolio" }),
  schema: z.object({
    name: z.string(),
    slug: z.string().optional(),
    tagline: z.string().optional(),
    summary: z.string().optional(),
    heroImage: z.string().optional(),
    heroCollage: z.array(z.string()).optional(),
    wordmark: z.string().optional(),
    websiteUrl: z.string().optional(),
    videos: z.array(z.string()).default([]),
    gallery: z.array(z.string()).default([]),
    order: z.number().default(100),
    featured: z.boolean().default(false),
    sections: z
      .array(
        z.object({
          number: z.string(),
          heading: z.string(),
          body: z.string(),
          image: z.string().optional(),
          bullets: z.array(z.string()).default([]),
        })
      )
      .default([]),
    services: z.array(z.string()).default([]),
    sectors: z.array(z.string()).default([]),
    year: z.number().optional(),
    needs_review: z.boolean().default(false),
    parse_notes: z.string().optional(),
  }),
});

const team = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/team" }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    portrait: z.string(),
    order: z.number().default(100),
  }),
});

// Service pages. Three clusters (performance-marketing, creative-and-content,
// web) with leaf services under each. Cluster parents use the same schema;
// they're identified by `cluster: true`.
const services = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/services" }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    cluster: z.string(), // "performance-marketing" | "creative-and-content" | "web"
    isClusterParent: z.boolean().default(false),
    summary: z.string(),
    metaDescription: z.string(),
    heroEyebrow: z.string().optional(),
    heroHeading: z.string(),
    heroBody: z.string(),
    whatItIs: z.string(),
    whatsIncluded: z.array(z.string()).default([]),
    process: z
      .array(z.object({ step: z.string(), label: z.string(), body: z.string() }))
      .default([]),
    sectorsThatBuy: z.array(z.string()).default([]),
    relatedServices: z.array(z.string()).default([]),
    relatedProgrammes: z.array(z.string()).default([]),
    caseStudySlugs: z.array(z.string()).default([]),
    faq: z.array(faqItemSchema).default([]),
    order: z.number().default(100),
  }),
});

// Sector pages. Five sectors from the doc.
const sectors = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/sectors" }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    summary: z.string(),
    metaDescription: z.string(),
    heroEyebrow: z.string().optional(),
    heroHeading: z.string(),
    heroBody: z.string(),
    challenges: z.array(z.string()).default([]),
    pointOfView: z.string().optional(),
    serviceSlugs: z.array(z.string()).default([]),
    programmeSlugs: z.array(z.string()).default([]),
    caseStudySlugs: z.array(z.string()).default([]),
    faq: z.array(faqItemSchema).default([]),
    aggregateMetrics: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .default([]),
    order: z.number().default(100),
  }),
});

// Programme pages. EI funded engagements per the doc.
const programmes = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/programmes" }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    summary: z.string(),
    metaDescription: z.string(),
    heroEyebrow: z.string().optional(),
    heroHeading: z.string(),
    heroBody: z.string(),
    eiInstrument: z.string().optional(),
    engagementValue: z.string().optional(),
    typicalDuration: z.string().optional(),
    eligibility: z.array(z.string()).default([]),
    whatYouGet: z.array(z.string()).default([]),
    process: z
      .array(z.object({ step: z.string(), label: z.string(), body: z.string() }))
      .default([]),
    sectorSlugs: z.array(z.string()).default([]),
    serviceSlugs: z.array(z.string()).default([]),
    faq: z.array(faqItemSchema).default([]),
    isUmbrella: z.boolean().default(false),
    order: z.number().default(100),
  }),
});

// /latest/ articles.
const articles = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    excerpt: z.string(),
    metaDescription: z.string(),
    author: z.string().default("Rooftop Twenty Two"),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).default([]),
    relatedServices: z.array(z.string()).default([]),
    relatedSectors: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

// Flat SEO landing pages (outside main IA). Templated single-page pieces
// targeting head terms like "marketing-agency-dublin".
const landing = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/landing" }),
  schema: z.object({
    slug: z.string(),
    h1: z.string(),
    metaTitle: z.string(),
    metaDescription: z.string(),
    headTerm: z.string(),
    location: z.string().optional(),
    relatedSectorSlug: z.string().optional(),
    relatedServiceSlug: z.string().optional(),
    subHeroBody: z.string(),
    whatWeDo: z.string(),
    trustLogos: z.array(z.string()).default([]),
    caseStudySlugs: z.array(z.string()).default([]),
    faq: z.array(faqItemSchema).default([]),
  }),
});

// Open roles for the Careers section.
const jobs = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/jobs" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    summary: z.string(),
    type: z.string().default("Full-time"),
    location: z.string().default("Dublin · Hybrid"),
    order: z.number().default(100),
    intro: z.string(),
    responsibilities: z.array(z.string()).default([]),
    requirements: z.array(z.string()).default([]),
    niceToHave: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { portfolio, team, services, sectors, programmes, articles, landing, jobs };
