import type { APIRoute } from "astro";
import { db } from "../../lib/db";
import { json, readBody, clean, meta, rateLimited, EMAIL_RE } from "../../lib/forms";

// This route runs on the server (Node/Vercel adapter), not prerendered.
export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  const m = meta(ctx);
  if (rateLimited("contact:" + m.ip)) return json({ ok: false, error: "Too many submissions, try again shortly." }, 429);

  const b = await readBody(ctx.request);
  if (clean(b._gotcha)) return json({ ok: true }); // honeypot: pretend success

  const name = clean(b.name, 200);
  const email = clean(b.email, 320);
  const message = clean(b.message, 5000);

  if (!name || !EMAIL_RE.test(email) || !message) {
    return json({ ok: false, error: "Please add your name, a valid email, and a message." }, 400);
  }

  const sql = db();
  if (!sql) {
    // No DATABASE_URL configured. Log so it's visible in server logs and don't
    // pretend it was saved.
    console.error("[contact] DATABASE_URL not set; submission not stored:", { name, email });
    return json({ ok: false, error: "We couldn't save that just now. Please email hey@rooftoptwentytwo.ie." }, 503);
  }

  try {
    await sql`
      insert into contact_submissions (name, email, phone, company, subject, message, routing, source_url, user_agent)
      values (${name}, ${email}, ${clean(b.phone, 60) || null}, ${clean(b.company, 200) || null},
              ${clean(b.subject, 300) || null}, ${message}, ${clean(b.routing, 200) || null},
              ${m.sourceUrl || null}, ${m.userAgent || null})
    `;
    return json({ ok: true });
  } catch (err) {
    console.error("[contact] insert failed:", err);
    return json({ ok: false, error: "Something went wrong. Please email hey@rooftoptwentytwo.ie." }, 500);
  }
};

// A bare GET is handy for a quick health check.
export const GET: APIRoute = () => json({ ok: true, endpoint: "contact" });
