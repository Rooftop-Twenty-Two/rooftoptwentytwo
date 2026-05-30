// Shared helpers for form API endpoints: parsing, JSON responses, honeypot,
// light rate-limiting, and reading common request metadata.
import type { APIContext } from "astro";

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Accept either JSON or classic form-encoded bodies (so the same endpoint works
// with fetch() and with a no-JS native form post).
export async function readBody(request: Request): Promise<Record<string, string>> {
  const type = request.headers.get("content-type") || "";
  if (type.includes("application/json")) {
    try {
      const obj = await request.json();
      return Object.fromEntries(
        Object.entries(obj as Record<string, unknown>).map(([k, v]) => [k, String(v ?? "")])
      );
    } catch {
      return {};
    }
  }
  const form = await request.formData();
  const out: Record<string, string> = {};
  for (const [k, v] of form.entries()) out[k] = typeof v === "string" ? v : "";
  return out;
}

export function clean(v: string | undefined, max = 2000): string {
  return (v ?? "").toString().trim().slice(0, max);
}

export function meta(ctx: APIContext) {
  const h = ctx.request.headers;
  return {
    sourceUrl: clean(h.get("referer") || "", 500),
    userAgent: clean(h.get("user-agent") || "", 500),
    ip: clean(h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "", 64),
  };
}

// Very small in-memory rate limit (per warm server instance). Stops casual
// hammering; real protection is the honeypot + DB unique constraints.
const hits = new Map<string, { n: number; t: number }>();
export function rateLimited(key: string, limit = 8, windowMs = 60_000): boolean {
  const now = Date.now();
  const rec = hits.get(key);
  if (!rec || now - rec.t > windowMs) {
    hits.set(key, { n: 1, t: now });
    return false;
  }
  rec.n += 1;
  return rec.n > limit;
}
