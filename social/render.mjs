// Rooftop Twenty Two — social graphics renderer.
// Reads posts.json, builds each post as branded HTML, screenshots to out/*.png.
// Run: node render.mjs            (all posts)
//      node render.mjs awards     (one pillar only)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "out");
fs.mkdirSync(OUT, { recursive: true });

let chromium;
for (const c of ["/opt/node22/lib/node_modules/playwright/index.mjs", "playwright"]) {
  try { ({ chromium } = await import(c)); break; } catch {}
}
if (!chromium) { console.error("Playwright not found. npm i -D playwright"); process.exit(1); }

const SIZES = {
  "ig-square":   { w: 1080, h: 1080 },
  "ig-portrait": { w: 1080, h: 1350 },
  "story":       { w: 1080, h: 1920 },
  "li-square":   { w: 1200, h: 1200 },
  "li-land":     { w: 1200, h: 627 },
};

const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const rich = (s = "") => esc(s).replace(/\[\[(.+?)\]\]/g, "<em>$1</em>");

function logo(theme) {
  const white = theme === "navy" || theme === "coral";
  return `<img class="logo" src="./assets/logos/rooftop-logo-${white ? "white" : "navy"}.svg" alt="Rooftop Twenty Two" />`;
}
const handle = `<span class="handle">@rooftoptwentytwo</span>`;

function bodyHTML(post) {
  switch (post.type) {
    case "award":
      return `
        ${post.eyebrow ? `<span class="eyebrow">${esc(post.eyebrow)}</span>` : `<span class="kicker">Award news</span>`}
        <h1 class="headline ${post.size || ""}">${rich(post.headline)}</h1>
        <div class="badges">
          ${(post.badges || []).map(b => `<span class="badge"><span class="badge__result">${esc(b.result)}</span> ${esc(b.name)}</span>`).join("")}
        </div>`;
    case "stat":
      return `
        ${post.eyebrow ? `<span class="eyebrow">${esc(post.eyebrow)}</span>` : ""}
        <div class="stat">${esc(post.stat)}</div>
        <p class="stat__label">${rich(post.label)}</p>
        ${post.client ? `<span class="pill">${esc(post.client)}</span>` : ""}`;
    case "quote":
      return `
        <span class="kicker">${esc(post.kicker || "In their words")}</span>
        <h1 class="headline ${post.size || "headline--md"}">&ldquo;${rich(post.quote)}&rdquo;</h1>
        ${post.attribution ? `<p class="attrib">${esc(post.attribution)}</p>` : ""}`;
    case "tip":
      return `
        <span class="eyebrow">${esc(post.eyebrow || "From the studio")}</span>
        <h1 class="headline ${post.size || "headline--md"}">${rich(post.headline)}</h1>
        <div class="rule"></div>
        ${post.copy ? `<p class="copy">${rich(post.copy)}</p>` : ""}`;
    case "hiring":
      return `
        <span class="eyebrow">We&rsquo;re hiring</span>
        <h1 class="headline ${post.size || "headline--lg"}">${rich(post.headline)}</h1>
        <p class="copy">${rich(post.copy || "Dublin · Hybrid · rooftoptwentytwo.ie/careers")}</p>`;
    case "carousel-slide":
      return `
        ${post.no ? `<span class="slide-no">${esc(post.no)}</span>` : ""}
        <h1 class="headline ${post.size || "headline--md"}">${rich(post.headline)}</h1>
        ${post.copy ? `<p class="copy">${rich(post.copy)}</p>` : ""}`;
    case "carousel-cover":
      return `
        <span class="eyebrow">${esc(post.eyebrow || "Swipe")}</span>
        <h1 class="headline ${post.size || "headline--lg"}">${rich(post.headline)}</h1>
        ${post.copy ? `<p class="copy">${rich(post.copy)}</p>` : ""}`;
    default: // headline
      return `
        ${post.kicker ? `<span class="kicker">${esc(post.kicker)}</span>` : ""}
        ${post.eyebrow ? `<span class="eyebrow">${esc(post.eyebrow)}</span>` : ""}
        <h1 class="headline ${post.size || ""}">${rich(post.headline)}</h1>
        ${post.copy ? `<p class="copy">${rich(post.copy)}</p>` : ""}`;
  }
}

function pageHTML(post, sizeClass) {
  const theme = post.theme || "cream";
  const body = bodyHTML(post);
  const foot = `<div class="post__foot">${handle}${
    post.cta ? `<span class="swipe">${esc(post.cta)}</span>`
    : post.swipe ? `<span class="swipe">Swipe &rarr;</span>`
    : `<span class="handle" style="opacity:0.6;">rooftoptwentytwo.ie</span>`
  }</div>`;
  const top = `<div class="post__top">${logo(theme)}${post.topRight ? `<span class="handle">${esc(post.topRight)}</span>` : ""}</div>`;

  // Three image modes: split panel, full-bleed bg, or none.
  if (post.photoSplit) {
    const side = post.photoSplit === "left" ? "split--left" : "split--right";
    return shell(theme, sizeClass, "has-split " + side, `
      <div class="split__media" style="background-image:url('${post.photo}')"></div>
      <div class="split__panel">${top}<div class="post__body">${body}</div>${foot}</div>`);
  }
  if (post.photo) {
    return shell(theme, sizeClass, "has-photo", `
      <div class="photo" style="background-image:url('${post.photo}')"></div>
      <div class="photo__scrim"></div>
      ${top}<div class="post__body">${body}</div>${foot}`);
  }
  return shell(theme, sizeClass, "", `${top}<div class="post__body">${body}</div>${foot}`);
}

function shell(theme, sizeClass, extra, inner) {
  return `<!doctype html><html><head><meta charset="utf-8">
    <link rel="stylesheet" href="./assets/brand.css"></head>
    <body style="margin:0;background:#fff;">
      <div class="post ${sizeClass} t-${theme} ${extra}">${inner}</div>
    </body></html>`;
}

const posts = JSON.parse(fs.readFileSync(path.join(__dirname, "posts.json"), "utf8"));
const onlyPillar = process.argv[2];
const browser = await chromium.launch({
  executablePath: process.env.PW_CHROME || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});
let n = 0;
for (const post of posts) {
  if (onlyPillar && post.pillar !== onlyPillar) continue;
  for (const fmt of (post.formats || ["ig-square"])) {
    const size = SIZES[fmt];
    if (!size) { console.warn("unknown format", fmt); continue; }
    const page = await browser.newPage({ viewport: { width: size.w, height: size.h }, deviceScaleFactor: 1 });
    await page.goto(pathToFileURL(path.join(__dirname, "template.html")).href);
    await page.setContent(pageHTML(post, fmt), { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(120);
    await (await page.$(".post")).screenshot({ path: path.join(OUT, `${post.id}__${fmt}.png`) });
    await page.close();
    n++;
    console.log("OK " + post.id + " " + fmt);
  }
}
await browser.close();
console.log("RENDERED " + n);
