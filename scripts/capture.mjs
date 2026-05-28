import { chromium, devices } from 'playwright';
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const URLS = readFileSync(join(ROOT, '_source/url-list.txt'), 'utf8')
  .split('\n').map(l => l.trim()).filter(Boolean);

const BREAKPOINTS = [
  { name: 'desktop', width: 1440, height: 900, dsf: 2 },
  { name: 'tablet', width: 768, height: 1024, dsf: 2 },
  { name: 'mobile', width: 390, height: 844, dsf: 2 },
];

const VIDEO_TARGETS = new Set([
  'https://rooftoptwentytwo.ie/',
  'https://rooftoptwentytwo.ie/portfolio/the-1933-furniture-company/',
]);
const STYLE_DUMP_TARGETS = new Set([
  'https://rooftoptwentytwo.ie/',
  'https://rooftoptwentytwo.ie/portfolio/',
  'https://rooftoptwentytwo.ie/portfolio/the-1933-furniture-company/',
  'https://rooftoptwentytwo.ie/about/',
  'https://rooftoptwentytwo.ie/contact/',
]);

function slug(url) {
  return url
    .replace(/^https?:\/\/rooftoptwentytwo\.ie\/?/, '')
    .replace(/\/$/, '')
    .replace(/\//g, '__') || 'home';
}

// Scroll the page in steps so lazy-loaded images + reveal animations fire,
// then return to the top before screenshot.
async function scrollAll(page) {
  await page.evaluate(async () => {
    const step = Math.max(window.innerHeight * 0.8, 600);
    const total = document.documentElement.scrollHeight;
    for (let y = 0; y < total; y += step) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 250));
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
    await new Promise(r => setTimeout(r, 600));
    window.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 400));
  });
}

async function dumpStyles(page, outPath) {
  const tokens = await page.evaluate(() => {
    const SAMPLE_SELECTORS = [
      'body', 'main',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'a', 'button',
      'header', 'footer', 'nav',
      '[class*="hero"]', '[class*="card"]', '[class*="btn"]',
      '[class*="portfolio"]', '[class*="cta"]',
    ];
    const seen = new Set();
    const out = [];
    for (const sel of SAMPLE_SELECTORS) {
      const nodes = document.querySelectorAll(sel);
      for (const node of nodes) {
        if (seen.has(node)) continue;
        seen.add(node);
        if (out.length > 600) break;
        const cs = getComputedStyle(node);
        out.push({
          selector: sel,
          tag: node.tagName.toLowerCase(),
          classes: node.className && typeof node.className === 'string' ? node.className.split(/\s+/).filter(Boolean).slice(0, 6) : [],
          text: (node.innerText || '').slice(0, 60).replace(/\s+/g, ' ').trim(),
          color: cs.color,
          background: cs.backgroundColor,
          backgroundImage: cs.backgroundImage !== 'none' ? cs.backgroundImage.slice(0, 200) : null,
          font: cs.fontFamily,
          fontSize: cs.fontSize,
          fontWeight: cs.fontWeight,
          lineHeight: cs.lineHeight,
          letterSpacing: cs.letterSpacing,
          textTransform: cs.textTransform,
          padding: cs.padding,
          margin: cs.margin,
          border: cs.border,
          borderRadius: cs.borderRadius,
          boxShadow: cs.boxShadow !== 'none' ? cs.boxShadow : null,
          transition: cs.transition !== 'all 0s ease 0s' ? cs.transition : null,
          display: cs.display,
        });
      }
      if (out.length > 600) break;
    }

    // Also capture document-level CSS custom properties.
    const rootCs = getComputedStyle(document.documentElement);
    const customProps = {};
    for (const prop of rootCs) {
      if (prop.startsWith('--')) customProps[prop] = rootCs.getPropertyValue(prop).trim();
    }

    // And the list of stylesheet hrefs in load order.
    const stylesheets = Array.from(document.styleSheets)
      .map(s => s.href)
      .filter(Boolean);

    // Loaded fonts (from FontFace set).
    const fonts = Array.from(document.fonts).map(f => ({
      family: f.family, weight: f.weight, style: f.style, status: f.status,
    }));

    return { customProps, stylesheets, fonts, samples: out };
  });
  writeFileSync(outPath, JSON.stringify(tokens, null, 2));
}

async function captureUrl(browser, url) {
  for (const bp of BREAKPOINTS) {
    const outDir = join(ROOT, '_source/screenshots', bp.name);
    mkdirSync(outDir, { recursive: true });
    const outPath = join(outDir, `${slug(url)}.png`);
    if (existsSync(outPath)) {
      console.log(`  [${bp.name}] skip ${slug(url)} (exists)`);
      continue;
    }

    const wantVideo = bp.name === 'desktop' && VIDEO_TARGETS.has(url);
    const ctxOpts = {
      viewport: { width: bp.width, height: bp.height },
      deviceScaleFactor: bp.dsf,
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
    };
    if (wantVideo) {
      const videoDir = join(ROOT, '_source/videos', slug(url));
      mkdirSync(videoDir, { recursive: true });
      ctxOpts.recordVideo = { dir: videoDir, size: { width: bp.width, height: bp.height } };
    }
    const ctx = await browser.newContext(ctxOpts);
    const page = await ctx.newPage();

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    } catch (e) {
      console.warn(`  [${bp.name}] goto warn ${url}: ${e.message}`);
    }

    // Dismiss common cookie banners (Cookiebot / Iubenda / WP popups).
    try {
      const candidates = [
        '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
        '#CybotCookiebotDialogBodyLevelButtonAccept',
        '.cookie-accept', '#cookie-accept',
        'button:has-text("Accept all")',
        'button:has-text("Accept All")',
        'button:has-text("Accept")',
        'button:has-text("I agree")',
      ];
      for (const sel of candidates) {
        const loc = page.locator(sel).first();
        if (await loc.count() && await loc.isVisible({ timeout: 500 }).catch(() => false)) {
          await loc.click({ timeout: 1500 }).catch(() => {});
          await page.waitForTimeout(400);
          break;
        }
      }
    } catch {}

    await scrollAll(page);
    await page.waitForTimeout(800);

    await page.screenshot({ path: outPath, fullPage: true, animations: 'disabled' });
    console.log(`  [${bp.name}] saved ${slug(url)}`);

    if (bp.name === 'desktop' && STYLE_DUMP_TARGETS.has(url)) {
      const styleDir = join(ROOT, '_source/styles');
      mkdirSync(styleDir, { recursive: true });
      await dumpStyles(page, join(styleDir, `${slug(url)}.json`));
      console.log(`  [styles] dumped ${slug(url)}`);
    }

    await page.close();
    await ctx.close();
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  console.log(`Capturing ${URLS.length} URLs at ${BREAKPOINTS.length} breakpoints…`);
  let i = 0;
  for (const url of URLS) {
    i++;
    console.log(`[${i}/${URLS.length}] ${url}`);
    try {
      await captureUrl(browser, url);
    } catch (e) {
      console.error(`  FAIL ${url}: ${e.message}`);
    }
  }
  await browser.close();
  console.log('Done.');
})();
