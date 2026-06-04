// @ts-check
import { defineConfig } from 'astro/config';
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import tailwindcss from '@tailwindcss/vite';

const SITE = 'https://rooftoptwentytwo.ie';

// Adapter is chosen at build time. Vercel sets the VERCEL env var on its build
// machines, so preview/production deploys there use the Vercel adapter.
// Everywhere else (local dev, the Docker image for r22.moveatpace.com) keeps
// the standalone Node adapter. Imported dynamically so each environment only
// loads the adapter it actually uses.
const onVercel = !!process.env.VERCEL;
const adapter = onVercel
  ? (await import('@astrojs/vercel')).default()
  : (await import('@astrojs/node')).default({ mode: 'standalone' });

/** @param {string} collection */
function collectionSlugs(collection) {
  const dir = join(process.cwd(), 'src', 'content', collection);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => /\.mdx?$/.test(f))
    .map((f) => f.replace(/\.mdx?$/, ''));
}

/**
 * @param {string} collection
 * @param {string} urlBase
 */
function collectionCustomPages(collection, urlBase) {
  return collectionSlugs(collection).map((slug) => `${SITE}${urlBase}${slug}/`);
}

// Legacy /portfolio/ URLs → /work/ permanent redirects.
// Astro normalises trailing slashes, so only the canonical-with-slash entry
// is needed per slug.
/** @type {Record<string, import('astro').RedirectConfig>} */
const portfolioRedirects = {
  '/portfolio/': { status: 301, destination: '/work/' },
};
for (const slug of collectionSlugs('portfolio')) {
  portfolioRedirects[`/portfolio/${slug}/`] = {
    status: 301,
    destination: `/work/${slug}/`,
  };
}

// https://astro.build/config
export default defineConfig({
  site: SITE,
  trailingSlash: 'always',
  adapter,
  redirects: portfolioRedirects,
  integrations: [
    mdx(),
    react(),
    keystatic(),
    sitemap({
      // Keep noindex pages (e.g. the post-enquiry thank-you, private /p/ decks)
      // out of the sitemap.
      filter: (page) => !/\/thank-you\/?$/.test(page) && !/\/p\//.test(page),
      customPages: [
        ...collectionCustomPages('portfolio', '/work/'),
        ...collectionCustomPages('services', '/services/'),
        ...collectionCustomPages('sectors', '/sectors/'),
        ...collectionCustomPages('programmes', '/programmes/'),
        ...collectionCustomPages('articles', '/latest/'),
        ...collectionCustomPages('landing', '/'),
      ],
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
