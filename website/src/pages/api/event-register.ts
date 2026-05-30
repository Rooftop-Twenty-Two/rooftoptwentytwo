import type { APIRoute } from "astro";
import { db } from "../../lib/db";
import { sendNotification, canEmail } from "../../lib/email";
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

  const company = clean(b.company, 200);
  const question = clean(b.question, 2000);

  const emailed = await sendNotification({
    subject: `Event interest: ${event} — ${name}`,
    title: "New event registration",
    replyTo: email,
    fields: [
      { label: "Event", value: event },
      { label: "Name", value: name },
      { label: "Email", value: email },
      { label: "Company", value: company },
      { label: "For the speaker", value: question },
      { label: "From page", value: m.sourceUrl },
    ],
  });

  const sql = db();
  if (sql) {
    try {
      await sql`
        insert into event_registrations (event, name, email, company, question, source_url, user_agent)
        values (${event}, ${name}, ${email}, ${company || null}, ${question || null},
                ${m.sourceUrl || null}, ${m.userAgent || null})`;
    } catch (err) {
      console.error("[event-register] db insert failed:", err);
    }
  }

  if (emailed.ok || sql) return json({ ok: true });
  console.error("[event-register] no delivery configured.");
  return json({ ok: false, error: "We couldn't add you just now. Please email hey@rooftoptwentytwo.ie." }, 503);
};

export const GET: APIRoute = () => json({ ok: true, endpoint: "event-register", email: canEmail });
