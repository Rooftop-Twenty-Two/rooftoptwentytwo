# Form submissions — where they go

All three site forms POST to server API routes:

| Form | Endpoint |
|---|---|
| Contact (contact page + case studies) | `/api/contact/` |
| Newsletter (footer) | `/api/subscribe/` |
| Event register-of-interest | `/api/event-register/` |

Each submission is **emailed to the team via Resend**. Storing in Postgres is
**optional** and only happens if `DATABASE_URL` is also set. You can run
email-only, DB-only, or both. If neither is configured, the form returns a
friendly "please email us" message instead of silently losing data.

## Email setup (Resend) — primary

1. **Create a Resend account** at resend.com and **verify your domain**
   (`rooftoptwentytwo.ie`). Resend gives you DNS records (SPF/DKIM) to add at
   your DNS host. Sending from a verified domain keeps mail out of spam.

2. **Create an API key** in Resend → API Keys.

3. **Add environment variables in Vercel** (Settings → Environment Variables,
   Production + Preview), then redeploy:

   | Name | Value |
   |---|---|
   | `RESEND_API_KEY` | `re_...` (from step 2) |
   | `CONTACT_TO` | `hey@rooftoptwentytwo.ie` (comma-separate for several) |
   | `CONTACT_FROM` | `Rooftop Twenty Two <hello@rooftoptwentytwo.ie>` (must be on the verified domain) |

That's it. Submissions now arrive as tidy emails, with **Reply-To set to the
sender** so you can reply straight from your inbox.

For local testing, put the same vars in `website/.env` (gitignored).

## Optional: also store in Postgres (Supabase)

Set `DATABASE_URL` as well and submissions are written to the database in
addition to the email. Tables: `contact_submissions`, `newsletter_subscribers`,
`event_registrations`.

1. Supabase → **SQL Editor** → paste [`db/schema.sql`](./schema.sql) → **Run**.
2. Supabase → **Settings → Database → Connection string → URI** (use the
   **pooler** string, port `6543`).
3. Add it to Vercel as `DATABASE_URL` (Production + Preview) and redeploy.

Read submissions in Supabase → **Table Editor**, or:
```sql
select created_at, name, email, subject from contact_submissions order by created_at desc;
select created_at, event, name, email from event_registrations order by created_at desc;
select created_at, email from newsletter_subscribers order by created_at desc;
```

## Notes
- Each endpoint has a honeypot field and light rate-limiting.
- Newsletter emails are de-duplicated in the DB (no error on repeats).
- A quick health check: open `/api/contact/` in a browser — it returns
  `{"ok":true,"endpoint":"contact","email":true}` when Resend is configured.
