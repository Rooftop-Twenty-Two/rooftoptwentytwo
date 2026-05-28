// @ts-check
import { defineConfig } from 'astro/config';
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import node from '@astrojs/node';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const SITE = 'https://rooftoptwentytwo.ie';

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
  adapter: node({ mode: 'standalone' }),
  redirects: portfolioRedirects,
  integrations: [
    mdx(),
    sitemap({
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
