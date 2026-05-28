import { load } from 'cheerio';
import fs from 'fs';
const html = fs.readFileSync(process.argv[2], 'utf8');
const $ = load(html);

// What kind of section containers does elementor use?
const classes = new Set();
$('[class*="elementor"]').each((i,el)=>{
  const c = $(el).attr('class') || '';
  if (c.includes('section') || c.includes('container')) classes.add(c.split(' ').find(x=>x.includes('elementor') && (x.includes('section')||x.includes('container'))));
});
[...classes].slice(0,30).forEach(c=>console.log(c));

console.log('--- structure top-down ---');
// Try finding top-level containers
$('main, body > .elementor, [data-elementor-type]').each((i,el)=>{
  console.log(`top: ${el.tagName}.${($(el).attr('class')||'').slice(0,80)}`);
});
