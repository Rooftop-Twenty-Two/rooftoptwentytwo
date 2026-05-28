import { load } from 'cheerio';
import fs from 'fs';
const html = fs.readFileSync(process.argv[2], 'utf8');
const $ = load(html);

// Get all top-level (e-parent) sections in order
const parents = $('div.e-parent').toArray();
console.log(`Total e-parents: ${parents.length}`);

parents.forEach((el, i) => {
  const $el = $(el);
  const headings = $el.find('.elementor-heading-title').map((j, h) => $(h).text().trim()).get().filter(t => t && t.length < 300);
  const texts = $el.find('.elementor-widget-text-editor .elementor-widget-container').map((j, t) => $(t).text().trim().replace(/\s+/g, ' ')).get().filter(t => t && !t.startsWith('/*!'));
  const imgs = $el.find('img[src*="uploads"]').map((j, im) => $(im).attr('src')).get().filter(s => !s.includes('Rooftop-Logo') && !s.includes('.svg') || s.includes('1934_Rev') || s.includes('Joseph-May'));
  const bgs = $el.find('[style*="background-image"]').map((j, b) => {
    const m = ($(b).attr('style')||'').match(/url\(([^)]+)\)/);
    return m ? m[1].replace(/['"]/g,'') : null;
  }).get().filter(Boolean);
  console.log(`\n=== PARENT[${i}] ===`);
  console.log('  headings:', headings.slice(0, 5).map(h=>`"${h.slice(0,50)}"`).join(', '));
  if (texts.length) console.log('  texts:', texts.slice(0,3).map(t=>`"${t.slice(0,100)}"`).join(' | '));
  if (imgs.length) console.log('  imgs:', imgs.slice(0,4));
  if (bgs.length) console.log('  bgs:', bgs.slice(0,4));
});
