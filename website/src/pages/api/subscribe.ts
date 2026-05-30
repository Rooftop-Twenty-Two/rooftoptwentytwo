import type { APIRoute } from "astro";
import { db } from "../../lib/db";
import { json, readBody, clean, meta, rateLimited, EMAIL_RE } from "../../lib/forms";

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  const m = meta(ctx);
  if (rateLimited("subscribe:" + m.ip)) return json({ ok: false, error: "Too many attempts, try again shortly." }, 429);

  const b = await readBody(ctx.request);
  if (clean(b._gotcha)) return json({ ok: true });

  const email = clean(b.email, 320);
  if (!EMAIL_RE.test(email)) return json({ ok: false, error: "Please add a valid email." }, 400);

  const sql = db();
  if (!sql) {
    console.error("[subscribe] DATABASE_URL not set; not stored:", email);
    return json({ ok: false, error: "We couldn't sign you up just now. Please email hey@rooftoptwentytwo.ie." }, 503);
  }

  try {
    // Idempotent: a repeat email is fine, no duplicate row, no error to the user.
    await sql`
      insert into newsletter_subscribers (email, source_url)
      values (${email}, ${m.sourceUrl || null})
      on conflict (email) do nothing
    `;
    return json({ ok: true });
  } catch (err) {
    console.error("[subscribe] insert failed:", err);
    return json({ ok: false, error: "Something went wrong. Please email hey@rooftoptwentytwo.ie." }, 500);
  }
};

export const GET: APIRoute = () => json({ ok: true, endpoint: "subscribe" });
