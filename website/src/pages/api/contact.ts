import type { APIRoute } from "astro";
import { db } from "../../lib/db";
import { sendNotification, canEmail } from "../../lib/email";
import { json, readBody, clean, meta, rateLimited, EMAIL_RE } from "../../lib/forms";

// Runs on the server (Node/Vercel adapter), not prerendered.
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

  const phone = clean(b.phone, 60);
  const company = clean(b.company, 200);
  const subject = clean(b.subject, 300);
  const routing = clean(b.routing, 200);

  // Primary: email the submission to the team via Resend.
  const emailed = await sendNotification({
    subject: `New enquiry${subject ? `: ${subject}` : ""} — ${name}`,
    title: "New website enquiry",
    replyTo: email,
    fields: [
      { label: "Name", value: name },
      { label: "Email", value: email },
      { label: "Phone", value: phone },
      { label: "Company", value: company },
      { label: "Subject", value: subject },
      { label: "Message", value: message },
      { label: "From page", value: m.sourceUrl },
    ],
  });

  // Optional: also store in Postgres if DATABASE_URL is configured.
  const sql = db();
  if (sql) {
    try {
      await sql`
        insert into contact_submissions (name, email, phone, company, subject, message, routing, source_url, user_agent)
        values (${name}, ${email}, ${phone || null}, ${company || null}, ${subject || null},
                ${message}, ${routing || null}, ${m.sourceUrl || null}, ${m.userAgent || null})`;
    } catch (err) {
      console.error("[contact] db insert failed:", err);
    }
  }

  if (emailed.ok || sql) return json({ ok: true });

  // Neither email nor DB is configured: don't pretend it was received.
  console.error("[contact] no delivery configured (no RESEND_API_KEY, no DATABASE_URL).");
  return json({ ok: false, error: "We couldn't send that just now. Please email hey@rooftoptwentytwo.ie." }, 503);
};

export const GET: APIRoute = () => json({ ok: true, endpoint: "contact", email: canEmail });
