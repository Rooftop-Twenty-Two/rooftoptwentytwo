import { load } from 'cheerio';
import fs from 'fs';
const html = fs.readFileSync(process.argv[2], 'utf8');
const $ = load(html);

// What's INSIDE PARENT[3], [4], [5]?
const parents = $('div.e-parent').toArray();
for (let i = 1; i < 6; i++) {
  console.log(`\n=== PARENT[${i}] raw text content ===`);
  // Strip script/style 
  const $el = $(parents[i]).clone();
  $el.find('script, style').remove();
  const text = $el.text().replace(/\s+/g, ' ').trim();
  console.log(`text(${text.length}c): "${text.slice(0,500)}"`);
  // List all descendant element classes
  const tags = [];
  $el.find('*').each((j, t) => {
    if (j < 30) {
      const c = ($(t).attr('class')||'').split(' ').filter(x=>x.includes('elementor-widget-')&&!x.includes('container')).join(',');
      if (c) tags.push(`${t.tagName}.${c}`);
    }
  });
  console.log('widgets:', [...new Set(tags)].slice(0,20).join(' / '));
}
