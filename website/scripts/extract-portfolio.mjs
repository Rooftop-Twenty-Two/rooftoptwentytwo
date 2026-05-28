// Targeted extraction for a single portfolio HTML file.
// Usage: node scripts/extract-portfolio.mjs <slug>
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEBSITE = join(__dirname, '..');
const PROJECT = join(WEBSITE, '..');
const MIRROR = join(PROJECT, '_source/mirror');

const slug = process.argv[2];
if (!slug) {
  console.error('Usage: extract-portfolio.mjs <slug>');
  process.exit(1);
}

const htmlPath = join(MIRROR, 'portfolio', slug, 'index.html');
if (!existsSync(htmlPath)) {
  console.error(`No HTML at ${htmlPath}`);
  process.exit(1);
}

const html = readFileSync(htmlPath, 'utf8');
const $ = cheerio.load(html);

const cleanText = (t) => (t || '').replace(/\s+/g, ' ').replace(/ /g, ' ').trim();

// Title: prefer og:title, fall back to <title>.
const ogTitle = $('meta[property="og:title"]').attr('content') || '';
const docTitle = $('title').text() || '';
const title = cleanText(ogTitle || docTitle).replace(/\s*[|–-]\s*Rooftop.*$/i, '');

// Collect all headings text + style classes for inspection.
const headings = [];
$('.elementor-heading-title').each((_, el) => {
  const $el = $(el);
  const t = cleanText($el.text());
  if (!t) return;
  const fontFamily = ($el.attr('style') || '').match(/font-family:\s*"?([^;,"]+)/i)?.[1] || '';
  const fontSize = ($el.attr('style') || '').match(/font-size:\s*([0-9.]+)([a-z%]+)/i);
  headings.push({ text: t, fontFamily, fontSize: fontSize ? fontSize[0] : null });
});

// Body paragraphs (Elementor text-editor widgets).
const paragraphs = [];
$('.elementor-widget-text-editor').each((_, el) => {
  const t = cleanText($(el).text());
  if (t && t.length > 20) paragraphs.push(t);
});

// Image URLs (img + background-image).
const images = new Set();
$('img').each((_, el) => {
  const src = $(el).attr('src') || $(el).attr('data-src') || '';
  if (src && src.includes('wp-content/uploads')) images.add(src);
});
$('[style*="background-image"]').each((_, el) => {
  const style = $(el).attr('style') || '';
  const m = style.match(/url\(["']?([^"')]+)["']?\)/);
  if (m && m[1].includes('wp-content/uploads')) images.add(m[1]);
});

// Section numbers (01-05) often appear as large numerals.
const numerals = headings.filter((h) => /^0[1-9]$/.test(h.text)).map((h) => h.text);

// Coral script taglines: rendered with Starlit Drive font (we look for it in style).
const tagline =
  headings.find((h) => /starlit/i.test(h.fontFamily))?.text ||
  headings.find((h) => h.text.length > 20 && h.text.length < 120 && /[A-Za-z]/.test(h.text))?.text ||
  null;

const result = {
  slug,
  title,
  tagline,
  numerals,
  heading_count: headings.length,
  paragraph_count: paragraphs.length,
  image_count: images.size,
  headings: headings.slice(0, 30),
  paragraphs: paragraphs.slice(0, 30),
  images: [...images].slice(0, 20),
};

console.log(JSON.stringify(result, null, 2));
