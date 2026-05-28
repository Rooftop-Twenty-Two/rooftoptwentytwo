import { load } from 'cheerio';
import fs from 'fs';
const html = fs.readFileSync(process.argv[2], 'utf8');
const $ = load(html);

// Strategy: walk the document in order, identify numbered sections by heading content
const headings = [];
$('.elementor-heading-title').each((i,el)=>{
  const t = $(el).text().trim();
  if (t && t.length < 300) headings.push({i, text: t, tag: el.tagName, el});
});

// For each "0N" heading, find next non-numeric heading (section heading)
for (let i = 0; i < headings.length; i++) {
  const h = headings[i];
  if (/^0\d$/.test(h.text)) {
    const next = headings[i+1];
    console.log(`SECTION ${h.text}: heading="${next?.text}"`);
  }
}

// Find images and their positions in order
console.log('--- main hero ---');
$('img').each((i,el)=>{
  const src = $(el).attr('src') || '';
  const alt = $(el).attr('alt') || '';
  const cls = $(el).attr('class') || '';
  if (src.includes('uploads') && !src.includes('Rooftop-Logo')) {
    console.log(`  ${src} | alt="${alt}" | class="${cls}"`);
  }
});
