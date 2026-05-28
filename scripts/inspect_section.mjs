import { load } from 'cheerio';
import fs from 'fs';
const html = fs.readFileSync('/Users/connor/Code/client-projects/rooftoptwentytwo/_source/mirror/portfolio/the-1933-furniture-company/index.html', 'utf8');
const $ = load(html);
const parents = $('.e-parent').toArray();
// PARENT[8] = "01 Project Overview"
const $s = $(parents[8]);
console.log('--- ALL <p> in section 01 ---');
$s.find('p').each((i, p) => {
  const t = $(p).text().trim().replace(/\s+/g, ' ');
  if (t) console.log(`p[${i}]: "${t.slice(0,300)}"`);
});
console.log('--- inner HTML widget types ---');
const widgets = new Set();
$s.find('[data-widget_type]').each((_, w) => widgets.add($(w).attr('data-widget_type')));
console.log([...widgets]);

// Check section 03 (challenge) and 04 (strategy)
for (let idx of [12, 14, 15]) {
  console.log(`\n--- PARENT[${idx}] paragraphs ---`);
  $(parents[idx]).find('p, li, h2, h3').each((i, p) => {
    const t = $(p).text().trim().replace(/\s+/g, ' ');
    if (t && t.length > 10 && t.length < 600) console.log(`  ${p.tagName}: "${t.slice(0,200)}"`);
  });
}
