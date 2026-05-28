// Extract team profiles from the /about/ page. The Rooftop layout puts each
// person as a (portrait image widget) + (name heading) + (role heading) trio.
// We anchor at the section title "The team behind your next big win." and
// read pairs of headings + portraits in DOM order until "Let's chat.".
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, readdirSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEBSITE = join(__dirname, '..');
const PROJECT = join(WEBSITE, '..');
const MIRROR = join(PROJECT, '_source/mirror');
const OUT_CONTENT = join(WEBSITE, 'src/content/team');
const OUT_IMAGES = join(WEBSITE, 'public/images/team');

mkdirSync(OUT_CONTENT, { recursive: true });
mkdirSync(OUT_IMAGES, { recursive: true });

const html = readFileSync(join(MIRROR, 'about/index.html'), 'utf8');
const $ = cheerio.load(html);

const ANCHOR = 'The team behind your next big win.';
const STOP = "Let's chat.";

// Collect headings in DOM order.
const headings = [];
$('.elementor-heading-title').each((_, el) => {
  const t = $(el).text().replace(/\s+/g, ' ').trim();
  if (t) headings.push(t);
});
const start = headings.indexOf(ANCHOR);
const end = headings.indexOf(STOP, start + 1);
if (start === -1) {
  console.error(`Anchor heading not found: ${ANCHOR}`);
  process.exit(1);
}
const slice = headings.slice(start + 1, end === -1 ? undefined : end);

// Pair up (name, role).
const team = [];
for (let i = 0; i + 1 < slice.length; i += 2) {
  const name = slice[i];
  const role = slice[i + 1];
  // Sanity: name should look like a person name (2-4 words, capitalised).
  if (!/^[A-ZÀ-ÿ]/.test(name)) break;
  if (name.split(' ').length > 5) break;
  team.push({ name, role });
}

// Collect portraits in DOM order. Walk all imgs in the document body, take
// those that come *after* the anchor heading element. Use index in
// element-order, not in img-only-order.
const allEls = [];
$('*').each((_, el) => allEls.push(el));

let foundAnchor = false;
const portraits = [];
for (const el of allEls) {
  const $el = $(el);
  if (!foundAnchor) {
    if (
      el.tagName &&
      $el.hasClass('elementor-heading-title') &&
      $el.text().replace(/\s+/g, ' ').trim() === ANCHOR
    ) {
      foundAnchor = true;
    }
    continue;
  }
  if (
    el.tagName &&
    $el.hasClass('elementor-heading-title') &&
    $el.text().replace(/\s+/g, ' ').trim() === STOP
  ) {
    break;
  }
  if (el.tagName === 'img') {
    const src = $el.attr('src') || $el.attr('data-src') || '';
    if (!src.includes('wp-content/uploads')) continue;
    const lower = src.toLowerCase();
    if (lower.endsWith('.svg') || lower.includes('rooftop-logo')) continue;
    portraits.push(src);
  }
}

function normalise(p) {
  return p.replace(/^https?:\/\/[^/]+\//, '').replace(/^(\.\.\/)+/, '');
}

function slugify(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function copyPortrait(src) {
  if (!src) return null;
  const candidates = [normalise(src)];
  const stripped = candidates[0].replace(/-\d+x\d+(\.[a-z]+)$/i, '$1');
  if (stripped !== candidates[0]) candidates.push(stripped);
  for (const cand of candidates) {
    const srcPath = join(MIRROR, cand);
    if (!existsSync(srcPath)) continue;
    const base = basename(srcPath);
    const dest = join(OUT_IMAGES, base);
    if (!existsSync(dest)) copyFileSync(srcPath, dest);
    return `/images/team/${base}`;
  }
  // Fallback: dir scan.
  const parent = dirname(join(MIRROR, candidates[candidates.length - 1]));
  if (existsSync(parent)) {
    const baseStem = basename(candidates[candidates.length - 1])
      .replace(/-\d+x\d+(\.[a-z]+)$/i, '$1')
      .replace(/\.(?:jpe?g|png|webp)$/i, '');
    const match = readdirSync(parent).find(
      (f) => f.startsWith(baseStem) && /\.(?:jpe?g|png|webp)$/i.test(f)
    );
    if (match) {
      const srcPath = join(parent, match);
      const dest = join(OUT_IMAGES, match);
      if (!existsSync(dest)) copyFileSync(srcPath, dest);
      return `/images/team/${match}`;
    }
  }
  return null;
}

let order = 10;
let count = 0;
let portraitIndex = 0;
const report = [];

for (const t of team) {
  // Find next unique portrait we haven't used (skip duplicates from img-1x,
  // img-2x carousels).
  let portraitPath = null;
  while (portraitIndex < portraits.length) {
    const p = copyPortrait(portraits[portraitIndex]);
    portraitIndex++;
    if (p) {
      portraitPath = p;
      break;
    }
  }
  const slug = slugify(t.name);
  const md = [
    '---',
    `name: "${t.name.replace(/"/g, '\\"')}"`,
    `role: "${t.role.replace(/"/g, '\\"')}"`,
    portraitPath ? `portrait: "${portraitPath}"` : 'portrait: "/images/team/placeholder.jpg"',
    `order: ${order}`,
    '---',
    '',
  ].join('\n');
  writeFileSync(join(OUT_CONTENT, `${slug}.md`), md);
  order += 10;
  count++;
  report.push({ name: t.name, role: t.role, portrait: portraitPath, slug });
  console.log(`✓ ${t.name} — ${t.role}${portraitPath ? '' : ' (no portrait)'}`);
}

console.log(`\nWrote ${count} team members. Portraits found for ${report.filter((r) => r.portrait).length}.`);
