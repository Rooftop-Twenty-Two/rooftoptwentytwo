// Generate right-sized WebP siblings for raster images in public/images.
// Originals are left untouched; a <picture> element (see Picture.astro) serves
// the WebP with the original as fallback. Idempotent: skips up-to-date WebPs.
import { readdir, stat } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(process.cwd(), "public/images");
const MAX_EDGE = 1600;      // never upscale; cap the longest edge
const QUALITY = 80;
const exts = new Set([".png", ".jpg", ".jpeg"]);

let made = 0, skipped = 0, failed = 0;

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { await walk(full); continue; }
    const ext = path.extname(entry.name).toLowerCase();
    if (!exts.has(ext)) continue;
    const out = full.slice(0, -ext.length) + ".webp";
    // Skip if a fresh WebP already exists.
    if (existsSync(out) && statSync(out).mtimeMs >= (await stat(full)).mtimeMs) { skipped++; continue; }
    try {
      const img = sharp(full, { failOn: "none" });
      const meta = await img.metadata();
      const longest = Math.max(meta.width ?? 0, meta.height ?? 0);
      const pipeline = longest > MAX_EDGE
        ? img.resize({ width: meta.width >= meta.height ? MAX_EDGE : undefined,
                       height: meta.height > meta.width ? MAX_EDGE : undefined,
                       withoutEnlargement: true })
        : img;
      await pipeline.webp({ quality: QUALITY }).toFile(out);
      made++;
    } catch (e) {
      failed++;
      console.warn("skip", full, e.message);
    }
  }
}

await walk(ROOT);
console.log(`WebP: ${made} written, ${skipped} up-to-date, ${failed} failed`);
