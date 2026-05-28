import { load } from 'cheerio';
import fs from 'fs';
const html = fs.readFileSync('/Users/connor/Code/client-projects/rooftoptwentytwo/_source/mirror/portfolio/the-1933-furniture-company/index.html', 'utf8');
const $ = load(html);
$('.elementor-heading-title').each((i,el)=>{
  const t = $(el).text().trim();
  if (t && t.length < 300) console.log(`HEAD[${i}]: "${t}"`);
});
console.log('--- text editors ---');
$('.elementor-widget-text-editor').each((i,el)=>{
  const t = $(el).text().trim().replace(/\s+/g,' ');
  if (t) console.log(`TXT[${i}] (${t.length}c): "${t.slice(0,250)}"`);
});
console.log('--- bg images ---');
$('[style*="background-image"]').each((i,el)=>{
  const s = $(el).attr('style') || '';
  const m = s.match(/url\(([^)]+)\)/);
  if (m) console.log(`BG[${i}]: ${m[1].replace(/['"]/g,'')}`);
});
console.log('--- imgs ---');
$('img').each((i,el)=>{
  const src = $(el).attr('src') || '';
  if (src.includes('uploads')) console.log(`IMG[${i}]: ${src}`);
});
