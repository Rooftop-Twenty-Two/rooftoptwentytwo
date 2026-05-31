// Email notifications via Resend (https://resend.com). Called by the form API
// routes. Uses the REST API directly (no SDK) to keep dependencies light.
//
// Env:
//   RESEND_API_KEY   required to actually send
//   CONTACT_TO       where submissions go (default hey@rooftoptwentytwo.ie)
//   CONTACT_FROM     verified sender (default "Rooftop Twenty Two <hello@rooftoptwentytwo.ie>")
//
// Returns { ok: true } on send, { ok: false, error } otherwise. Never throws.

const KEY = process.env.RESEND_API_KEY;
const TO = (process.env.CONTACT_TO || "hey@rooftoptwentytwo.ie")
  .split(",").map((s) => s.trim()).filter(Boolean);
const FROM = process.env.CONTACT_FROM || "Rooftop Twenty Two <hello@rooftoptwentytwo.ie>";

export const canEmail = !!KEY;

const esc = (s: string) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

type Field = { label: string; value?: string };

function buildHtml(title: string, fields: Field[]) {
  const rows = fields
    .filter((f) => f.value)
    .map(
      (f) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#6A6F97;font:600 13px/1.4 Arial,sans-serif;vertical-align:top;white-space:nowrap;">${esc(
          f.label
        )}</td><td style="padding:6px 0;color:#0D2030;font:400 15px/1.5 Arial,sans-serif;">${esc(
          f.value!
        ).replace(/\n/g, "<br>")}</td></tr>`
    )
    .join("");
  return `<div style="max-width:560px;margin:0 auto;font-family:Arial,sans-serif;">
    <p style="font:700 12px/1 Arial;letter-spacing:.12em;text-transform:uppercase;color:#E15047;margin:0 0 6px;">Rooftop Twenty Two</p>
    <h1 style="font:700 22px/1.2 Georgia,serif;color:#0D2030;margin:0 0 18px;">${esc(title)}</h1>
    <table style="border-collapse:collapse;width:100%;border-top:1px solid #ECE8E7;">${rows}</table>
  </div>`;
}

export async function sendNotification(opts: {
  subject: string;
  title: string;
  fields: Field[];
  replyTo?: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!KEY) return { ok: false, error: "RESEND_API_KEY not set" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: TO,
        subject: opts.subject,
        html: buildHtml(opts.title, opts.fields),
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[resend] send failed", res.status, detail.slice(0, 300));
      return { ok: false, error: `Resend ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("[resend] send error", err);
    return { ok: false, error: "send error" };
  }
}
