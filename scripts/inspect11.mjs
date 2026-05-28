import { load } from 'cheerio';
import fs from 'fs';
const html = fs.readFileSync(process.argv[2], 'utf8');
const $ = load(html);
const parents = $('.e-parent').toArray();
console.log(`total e-parent: ${parents.length}`);
parents.forEach((el, i) => {
  console.log(`[${i}] ${el.tagName}.${($(el).attr('class')||'').slice(0,80)}`);
  const headings = $(el).find('.elementor-heading-title').map((_, h) => $(h).text().trim()).get();
  console.log(`   headings:`, headings.slice(0, 6));
});
