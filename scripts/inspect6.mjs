import { load } from 'cheerio';
import fs from 'fs';
const html = fs.readFileSync(process.argv[2], 'utf8');
const $ = load(html);
const main = $('main.site-main');
const mainEl = main.find('div.elementor').first();
const children = mainEl.children().toArray();

// Block 0 = intro/hero  
const intro = $(children[0]);
console.log('=== INTRO BLOCK ===');
console.log('headings:');
intro.find('.elementor-heading-title').each((i,el)=>console.log(`  - "${$(el).text().trim()}"`));
console.log('imgs:');
intro.find('img[src*="uploads"]').each((i,el)=>console.log(`  - ${$(el).attr('src')}`));
console.log('bg-images:');
intro.find('[style*="background-image"]').each((i,el)=>{
  const m = ($(el).attr('style')||'').match(/url\(([^)]+)\)/);
  if (m) console.log(`  - ${m[1].replace(/['"]/g,'')}`);
});

// Section 4 = "01" (Project Overview)
console.log('=== "01" block (idx 4) ===');
const s1 = $(children[4]);
console.log('headings:');
s1.find('.elementor-heading-title').each((i,el)=>console.log(`  - "${$(el).text().trim().slice(0,80)}"`));
console.log('text:');
s1.find('.elementor-widget-text-editor').each((i,el)=>{
  const t = $(el).text().trim().replace(/\s+/g,' ');
  if (t && !t.startsWith('/*!')) console.log(`  - "${t.slice(0,200)}"`);
});

// idx 5 = following block (might have image for 01)
console.log('=== idx 5 ===');
const s2 = $(children[5]);
console.log('headings:');
s2.find('.elementor-heading-title').each((i,el)=>console.log(`  - "${$(el).text().trim().slice(0,80)}"`));
console.log('imgs:');
s2.find('img[src*="uploads"]').each((i,el)=>console.log(`  - ${$(el).attr('src')}`));

// idx 6 = block following 01 - "Thanks Ruth!"
console.log('=== idx 6 ===');
const s3 = $(children[6]);
console.log('headings:');
s3.find('.elementor-heading-title').each((i,el)=>console.log(`  - "${$(el).text().trim().slice(0,80)}"`));
console.log('text:');
s3.find('.elementor-widget-text-editor').each((i,el)=>{
  const t = $(el).text().trim().replace(/\s+/g,' ');
  if (t && !t.startsWith('/*!')) console.log(`  - "${t.slice(0,200)}"`);
});
console.log('imgs:');
s3.find('img[src*="uploads"]').each((i,el)=>console.log(`  - ${$(el).attr('src')}`));
