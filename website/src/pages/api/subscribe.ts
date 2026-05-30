import type { APIRoute } from "astro";
import { db } from "../../lib/db";
import { sendNotification, canEmail } from "../../lib/email";
import { json, readBody, clean, meta, rateLimited, EMAIL_RE } from "../../lib/forms";

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  const m = meta(ctx);
  if (rateLimited("subscribe:" + m.ip)) return json({ ok: false, error: "Too many attempts, try again shortly." }, 429);

  const b = await readBody(ctx.request);
  if (clean(b._gotcha)) return json({ ok: true });

  const email = clean(b.email, 320);
  if (!EMAIL_RE.test(email)) return json({ ok: false, error: "Please add a valid email." }, 400);

  const emailed = await sendNotification({
    subject: `Newsletter sign-up — ${email}`,
    title: "New newsletter subscriber",
    fields: [
      { label: "Email", value: email },
      { label: "From page", value: m.sourceUrl },
    ],
  });

  const sql = db();
  if (sql) {
    try {
      await sql`
        insert into newsletter_subscribers (email, source_url)
        values (${email}, ${m.sourceUrl || null})
        on conflict (email) do nothing`;
    } catch (err) {
      console.error("[subscribe] db insert failed:", err);
    }
  }

  if (emailed.ok || sql) return json({ ok: true });
  console.error("[subscribe] no delivery configured.");
  return json({ ok: false, error: "We couldn't sign you up just now. Please email hey@rooftoptwentytwo.ie." }, 503);
};

export const GET: APIRoute = () => json({ ok: true, endpoint: "subscribe", email: canEmail });
