import { load } from 'cheerio';
import fs from 'fs';
const html = fs.readFileSync(process.argv[2], 'utf8');
const $ = load(html);

// Find body images via DOM walk - find sections containing "01" "02" etc.
// Strategy: locate elementor sections. Use the .elementor-element walk.
console.log('--- main containers ---');
$('section.elementor-section').each((i,el)=>{
  const text = $(el).find('.elementor-heading-title').first().text().trim().slice(0,40);
  const imgs = $(el).find('img[src*="uploads"]').not('[src*="Rooftop-Logo"]');
  console.log(`SEC[${i}] head="${text}" imgs=${imgs.length}`);
});
