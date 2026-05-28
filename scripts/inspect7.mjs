import { load } from 'cheerio';
import fs from 'fs';
const html = fs.readFileSync(process.argv[2], 'utf8');
const $ = load(html);

// Look at every elementor section in document order, focused on headings/text
$('div[class*="e-con"]').each((i,el)=>{
  const cls = ($(el).attr('class')||'');
  // Only top-level (no e-con parent)
  if (cls.includes('e-parent')) {
    const head = $(el).find('.elementor-heading-title').first().text().trim().slice(0,40);
    console.log(`PARENT[${i}] head="${head}"`);
  }
});

console.log('--- all e-con-full ---');
let cnt = 0;
$('div.e-con-full, div.e-parent').each((i,el)=>{
  if (cnt++ > 30) return;
  const head = $(el).find('.elementor-heading-title').first().text().trim().slice(0,30);
  const cls = ($(el).attr('class')||'').slice(0,60);
  console.log(`[${i}] ${cls} head="${head}"`);
});
