// Bulk-migrate all portfolio HTML files into MDX with frontmatter conforming
// to website/src/content.config.ts. Copies hero images into
// website/public/images/portfolio/<slug>/. Re-runs are idempotent — skips
// files where the MDX already exists unless --force is passed.
//
// Usage: node scripts/migrate-portfolio.mjs [--force] [--only <slug>]
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  copyFileSync,
  readdirSync,
} from 'node:fs';
import { dirname, join, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEBSITE = join(__dirname, '..');
const PROJECT = join(WEBSITE, '..');
const MIRROR = join(PROJECT, '_source/mirror');
const PORTFOLIO_DIR = join(MIRROR, 'portfolio');
const OUT_CONTENT = join(WEBSITE, 'src/content/portfolio');
const OUT_IMAGES = join(WEBSITE, 'public/images/portfolio');

const args = new Set(process.argv.slice(2));
const force = args.has('--force');
const only =
  process.argv.includes('--only')
    ? process.argv[process.argv.indexOf('--only') + 1]
    : null;

mkdirSync(OUT_CONTENT, { recursive: true });
mkdirSync(OUT_IMAGES, { recursive: true });

const FLAGSHIPS = {
  'the-1933-furniture-company': { order: 1, featured: true },
  'joseph-may': { order: 2, featured: true },
  'gourmet-food-parlour': { order: 3, featured: true },
};

// Headings we never want to treat as content (nav / footer chrome).
// Note: section titles like "Project Overview", "Key Stats", "Challenge",
// "Strategy", "Impact" are NOT stops — they are the very titles we extract.
const STOP_HEADINGS = new Set([
  'The Studio Jukebox',
  'Find us on social →',
  "Let's chat.",
  '← Back to all projects',
  'Have a similar project?',
  'Thanks Ruth!',
  'Availing of ourPremium Plan',
  'Privacy Policy | Cookie Policy | Terms & Conditions',
]);

function cleanText(t) {
  return (t || '')
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeYaml(s) {
  if (s == null) return '';
  return s.replace(/"/g, '\\"');
}

function normaliseImagePath(raw) {
  if (!raw) return null;
  // Strip absolute URL host so we can resolve against the mirror.
  let s = raw.trim();
  s = s.replace(/^https?:\/\/[^/]+\//, '');
  s = s.replace(/^\.\.\//g, '');
  return s;
}

function pickHeroImage($) {
  // 1. og:image
  const og = $('meta[property="og:image"]').attr('content');
  const ogPath = normaliseImagePath(og);
  if (ogPath && ogPath.includes('wp-content/uploads')) return ogPath;
  // 2. Background images on hero sections.
  let bg = null;
  $('[style*="background-image"]').each((_, el) => {
    if (bg) return;
    const m = ($(el).attr('style') || '').match(/url\(["']?([^"')]+)["']?\)/);
    if (!m) return;
    const p = normaliseImagePath(m[1]);
    if (!p || !p.includes('wp-content/uploads')) return;
    const lower = p.toLowerCase();
    if (lower.endsWith('.svg')) return;
    if (lower.includes('-768x432')) return; // next-project tiles
    if (lower.includes('rooftop-logo')) return;
    bg = p;
  });
  if (bg) return bg;
  // 3. First content img.
  let pick = null;
  $('img').each((_, el) => {
    if (pick) return;
    const src = $(el).attr('src') || $(el).attr('data-src') || '';
    const p = normaliseImagePath(src);
    if (!p || !p.includes('wp-content/uploads')) return;
    const lower = p.toLowerCase();
    if (lower.includes('rooftop-logo')) return;
    if (lower.endsWith('.svg')) return;
    if (lower.includes('-768x432')) return;
    pick = p;
  });
  return pick;
}

function resolveMirrorPath(refPath) {
  // refPath may be relative like ../../wp-content/uploads/...
  const clean = refPath.replace(/^(\.\.\/)+/, '');
  return join(MIRROR, clean);
}

function copyImage(rawSrc, slug) {
  if (!rawSrc) return null;
  // Try a sequence of fallback paths for resilience against WP size variants.
  const exts = '\\.(?:jpe?g|png|webp)';
  const candidates = [rawSrc];
  const stripped = rawSrc.replace(/-\d+x\d+(\.[a-z]+)$/i, '$1');
  if (stripped !== rawSrc) candidates.push(stripped);

  for (const cand of candidates) {
    const srcPath = resolveMirrorPath(cand);
    if (existsSync(srcPath)) {
      const base = basename(srcPath);
      const slugDir = join(OUT_IMAGES, slug);
      mkdirSync(slugDir, { recursive: true });
      const dest = join(slugDir, base);
      if (!existsSync(dest)) copyFileSync(srcPath, dest);
      return `/images/portfolio/${slug}/${base}`;
    }
  }

  // Last-resort: scan the parent directory for any file that shares the stem
  // prefix (handles e.g. og refers to "name-1024x683.jpg" but mirror has
  // "name-1-1024x683.jpg" or "name-scaled.jpg").
  const last = candidates[candidates.length - 1];
  const parent = dirname(resolveMirrorPath(last));
  if (existsSync(parent)) {
    const baseStem = basename(last)
      .replace(/-\d+x\d+(\.[a-z]+)$/i, '$1')
      .replace(new RegExp(`${exts}$`, 'i'), '');
    const dirFiles = readdirSync(parent);
    const match = dirFiles.find((f) =>
      f.startsWith(baseStem) && new RegExp(`${exts}$`, 'i').test(f)
    );
    if (match) {
      const srcPath = join(parent, match);
      const slugDir = join(OUT_IMAGES, slug);
      mkdirSync(slugDir, { recursive: true });
      const dest = join(slugDir, match);
      if (!existsSync(dest)) copyFileSync(srcPath, dest);
      return `/images/portfolio/${slug}/${match}`;
    }
  }
  return null;
}

function extractServices(headings) {
  // Services appear as single short capitalised headings between the hero and section 01.
  // We collect headings until we hit "01" or "Project Overview".
  const services = [];
  for (const h of headings) {
    const t = h.text;
    if (t === '01' || t === 'Project Overview') break;
    // Skip system/standard headings that aren't services.
    if (STOP_HEADINGS.has(t)) continue;
    if (/^[A-Z]/.test(t) && t.length < 35 && !t.includes('.') && !t.startsWith('“')) {
      // Avoid duplicating tagline (long) or numerals.
      if (/^0\d$/.test(t)) continue;
      if (t.split(' ').length <= 4) services.push(t);
    }
  }
  // De-dupe while preserving order.
  return [...new Set(services)];
}

function looksLikeQuote(p) {
  if (!p) return false;
  const trimmed = p.trim();
  if (trimmed.length < 200 && /^[—–-]\s/.test(trimmed)) return true;
  if (trimmed.length < 200 && /\b(Director|Founder|CEO|Owner|Manager)\b/.test(trimmed) && trimmed.includes('—')) return true;
  return false;
}

function isElementorCss(p) {
  return /^\/\*!\s*elementor/.test(p) || /elementor-widget-text-editor/.test(p.slice(0, 200));
}

function stripElementorPrefix(p) {
  // Some paragraphs have the Elementor CSS prefix glued to the real text.
  // Strip everything up to and including the first `}` followed by whitespace then a capital letter or quote.
  const idx = p.search(/}\s+[A-Z“"]/);
  if (idx > 0) return p.slice(idx + 1).trim();
  return p.trim();
}

function extractSections(headings, paragraphs) {
  // Walk headings linearly. Each numeral (/^0\d$/) marks the start of a
  // section; the next non-numeral, non-stop heading is the section title.
  // This handles both clean 01..05 pages and pages with duplicate or skipped
  // numerals (e.g. 01, 02, 02, 03, 04).
  const numeralHits = [];
  for (let i = 0; i < headings.length; i++) {
    if (!/^0\d$/.test(headings[i].text)) continue;
    // Find next title.
    for (let j = i + 1; j < headings.length; j++) {
      const t = headings[j].text;
      if (/^0\d$/.test(t)) break; // hit the next numeral without finding a title
      if (STOP_HEADINGS.has(t)) continue;
      numeralHits.push({ number: headings[i].text, heading: t });
      break;
    }
  }

  // Clean candidate body paragraphs.
  const bodies = paragraphs
    .map((p) => (isElementorCss(p) ? stripElementorPrefix(p) : p.trim()))
    .filter((p) => p && p.length > 60 && !looksLikeQuote(p));

  const sections = [];
  numeralHits.forEach((hit, i) => {
    const body = bodies[i];
    if (!body) return;
    sections.push({ number: hit.number, heading: hit.heading, body });
  });
  return sections;
}

function buildMdx(slug, data) {
  const { name, tagline, summary, heroImage, sections, services, order, featured, needsReview, parseNotes } = data;
  const yaml = [
    '---',
    `name: "${escapeYaml(name)}"`,
    `slug: "${slug}"`,
    tagline ? `tagline: "${escapeYaml(tagline)}"` : null,
    summary ? `summary: "${escapeYaml(summary)}"` : null,
    heroImage ? `heroImage: "${heroImage}"` : null,
    `order: ${order}`,
    `featured: ${featured}`,
    services && services.length
      ? `services: [${services.map((s) => `"${escapeYaml(s)}"`).join(', ')}]`
      : null,
    sections && sections.length
      ? [
          'sections:',
          ...sections.map((s) =>
            [
              `  - number: "${s.number}"`,
              `    heading: "${escapeYaml(s.heading)}"`,
              `    body: "${escapeYaml(s.body)}"`,
            ].join('\n')
          ),
        ].join('\n')
      : null,
    needsReview ? `needs_review: true` : null,
    parseNotes ? `parse_notes: "${escapeYaml(parseNotes)}"` : null,
    '---',
    '',
  ]
    .filter((l) => l !== null)
    .join('\n');
  return yaml;
}

function migrateOne(slug) {
  const htmlPath = join(PORTFOLIO_DIR, slug, 'index.html');
  if (!existsSync(htmlPath)) return { slug, status: 'missing-html' };
  const outPath = join(OUT_CONTENT, `${slug}.mdx`);
  if (existsSync(outPath) && !force) return { slug, status: 'skipped-exists' };

  const html = readFileSync(htmlPath, 'utf8');
  const $ = cheerio.load(html);

  // Title.
  const ogTitle = $('meta[property="og:title"]').attr('content') || '';
  const docTitle = $('title').text() || '';
  const titleRaw = ogTitle || docTitle;
  const name = cleanText(titleRaw)
    .replace(/\s*[|–-]\s*Rooftop.*$/i, '')
    .replace(/\s*–\s*Rooftop.*$/i, '');

  // Headings.
  const headings = [];
  $('.elementor-heading-title').each((_, el) => {
    const t = cleanText($(el).text());
    if (t) headings.push({ text: t });
  });

  // Paragraphs.
  const paragraphs = [];
  $('.elementor-widget-text-editor').each((_, el) => {
    const t = cleanText($(el).text());
    if (t && t.length > 20) paragraphs.push(t);
  });

  // Tagline: heading immediately preceding "01" in heading order. Must be a
  // multi-word sentence-length string, not a single-word service label.
  let tagline = null;
  const idx01 = headings.findIndex((h) => h.text === '01');
  if (idx01 > 0) {
    for (let i = idx01 - 1; i >= 0; i--) {
      const t = headings[i].text;
      if (STOP_HEADINGS.has(t)) continue;
      if (/^0\d$/.test(t)) continue;
      if (t.length < 18) continue;
      if (t.split(/\s+/).length < 4) continue;
      tagline = t;
      break;
    }
  }

  // Sections + services.
  const sections = extractSections(headings, paragraphs);
  const services = extractServices(headings);

  // Summary: take section 01 body if present.
  const summary = sections[0]?.body?.slice(0, 280) ?? null;

  // Hero image.
  const heroSrc = pickHeroImage($);
  const heroPath = copyImage(heroSrc, slug);

  // Flagship overrides.
  const flag = FLAGSHIPS[slug] ?? { order: 100, featured: false };

  // Needs review heuristic.
  const needsReview = !tagline || sections.length < 3 || !heroPath;
  const parseNotes = needsReview
    ? [
        !tagline ? 'no tagline detected' : null,
        sections.length < 3 ? `only ${sections.length} sections parsed` : null,
        !heroPath ? 'no hero image' : null,
      ]
        .filter(Boolean)
        .join('; ')
    : null;

  const mdx = buildMdx(slug, {
    name,
    tagline,
    summary,
    heroImage: heroPath,
    sections,
    services,
    order: flag.order,
    featured: flag.featured,
    needsReview,
    parseNotes,
  });

  writeFileSync(outPath, mdx);
  return {
    slug,
    status: needsReview ? 'parsed-needs-review' : 'parsed-clean',
    sections: sections.length,
    services: services.length,
    hero: !!heroPath,
    notes: parseNotes,
  };
}

const slugs = only
  ? [only]
  : readdirSync(PORTFOLIO_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

const report = [];
for (const slug of slugs) {
  const r = migrateOne(slug);
  console.log(JSON.stringify(r));
  report.push(r);
}

const clean = report.filter((r) => r.status === 'parsed-clean').length;
const needsReview = report.filter((r) => r.status === 'parsed-needs-review').length;
const skipped = report.filter((r) => r.status === 'skipped-exists').length;
const missing = report.filter((r) => r.status === 'missing-html').length;
console.log('\n=== Summary ===');
console.log(`Clean:        ${clean}`);
console.log(`Needs review: ${needsReview}`);
console.log(`Skipped:      ${skipped}`);
console.log(`Missing:      ${missing}`);
console.log(`Total:        ${report.length}`);

writeFileSync(
  join(WEBSITE, 'scripts', 'migration-report.json'),
  JSON.stringify(report, null, 2)
);
