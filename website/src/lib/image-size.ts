// Build-time image dimensions for files under public/. Used to stamp width and
// height on <img> tags so browsers reserve space before images load (no CLS).
// sharp ships with Astro; if it's ever unavailable we simply skip the attributes.
import { existsSync } from "node:fs";
import path from "node:path";

type Dims = { width: number; height: number };
const cache = new Map<string, Dims | null>();

export async function imageSize(src: string): Promise<Dims | null> {
  if (!src || !src.startsWith("/")) return null;
  if (cache.has(src)) return cache.get(src)!;
  let dims: Dims | null = null;
  const file = path.join(process.cwd(), "public", decodeURIComponent(src.split("?")[0]));
  if (existsSync(file)) {
    try {
      const sharp = (await import("sharp")).default;
      const meta = await sharp(file).metadata();
      if (meta.width && meta.height) dims = { width: meta.width, height: meta.height };
    } catch {
      dims = null;
    }
  }
  cache.set(src, dims);
  return dims;
}
