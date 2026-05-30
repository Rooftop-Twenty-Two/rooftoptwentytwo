import type { APIRoute } from "astro";
import { db } from "../../lib/db";
import { json, readBody, clean, meta, rateLimited, EMAIL_RE } from "../../lib/forms";

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  const m = meta(ctx);
  if (rateLimited("event:" + m.ip)) return json({ ok: false, error: "Too many submissions, try again shortly." }, 429);

  const b = await readBody(ctx.request);
  if (clean(b._gotcha)) return json({ ok: true });

  const name = clean(b.name, 200);
  const email = clean(b.email, 320);
  const event = clean(b.event, 120) || "unknown";

  if (!name || !EMAIL_RE.test(email)) {
    return json({ ok: false, error: "Please add your name and a valid email." }, 400);
  }

  const sql = db();
  if (!sql) {
    console.error("[event-register] DATABASE_URL not set; not stored:", { event, name, email });
    return json({ ok: false, error: "We couldn't add you just now. Please email hey@rooftoptwentytwo.ie." }, 503);
  }

  try {
    await sql`
      insert into event_registrations (event, name, email, company, question, source_url, user_agent)
      values (${event}, ${name}, ${email}, ${clean(b.company, 200) || null},
              ${clean(b.question, 2000) || null}, ${m.sourceUrl || null}, ${m.userAgent || null})
    `;
    return json({ ok: true });
  } catch (err) {
    console.error("[event-register] insert failed:", err);
    return json({ ok: false, error: "Something went wrong. Please email hey@rooftoptwentytwo.ie." }, 500);
  }
};

export const GET: APIRoute = () => json({ ok: true, endpoint: "event-register" });
