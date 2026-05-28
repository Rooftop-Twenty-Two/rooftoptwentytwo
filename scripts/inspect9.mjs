import { load } from 'cheerio';
import fs from 'fs';
const html = fs.readFileSync(process.argv[2], 'utf8');
const $ = load(html);

const parents = $('div.e-parent').toArray();
// Examine first 6 parents fully (intro/hero area)
for (let i = 0; i < 7; i++) {
  console.log(`\n=== PARENT[${i}] ===`);
  const $el = $(parents[i]);
  // All visible text content
  $el.find('h1, h2, h3, h4, h5, h6, p, .elementor-heading-title, .elementor-widget-text-editor').each((j, t) => {
    const text = $(t).text().trim().replace(/\s+/g, ' ');
    if (text && !text.startsWith('/*!') && text.length < 500) {
      console.log(`  [${t.tagName}.${($(t).attr('class')||'').slice(0,30)}]: "${text.slice(0,200)}"`);
    }
  });
  // imgs
  $el.find('img[src*="uploads"]').each((j, im) => {
    console.log(`  IMG: ${$(im).attr('src')}`);
  });
}
