import { load } from 'cheerio';
import fs from 'fs';
const html = fs.readFileSync(process.argv[2], 'utf8');
const $ = load(html);
const main = $('main.site-main');
// Walk top-level children of the main elementor
const mainEl = main.find('div.elementor').first();
console.log('children of main elementor:');
mainEl.children().each((i,el)=>{
  const cls = ($(el).attr('class')||'').slice(0,80);
  const head = $(el).find('.elementor-heading-title').first().text().trim().slice(0,50);
  const imgs = $(el).find('img[src*="uploads"]').not('[src*="Rooftop-Logo"]').length;
  console.log(`[${i}] ${el.tagName}.${cls} head="${head}" imgs=${imgs}`);
});
