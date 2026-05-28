import { load } from 'cheerio';
import fs from 'fs';
// Check BCI tagline - it might be missing or in a different position
const html = fs.readFileSync('/Users/connor/Code/client-projects/rooftoptwentytwo/_source/mirror/portfolio/breast-cancer-ireland/index.html', 'utf8');
const $ = load(html);
const parents = $('.e-parent').toArray();
const scrollBox = parents[5];
const headings = $(scrollBox).find('.elementor-heading-title').map((_, h) => {
  const tag = h.tagName;
  const txt = $(h).text().trim();
  return {tag, txt};
}).get();
console.log('headings in scroll-box:');
headings.forEach(h => console.log(`  ${h.tag}: "${h.txt}"`));
