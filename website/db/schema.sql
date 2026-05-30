-- Rooftop Twenty Two — form submissions schema.
-- Run once against your Postgres database (Vercel Postgres / Supabase / Neon):
--   psql "$DATABASE_URL" -f db/schema.sql
-- Safe to re-run (IF NOT EXISTS throughout).

-- Contact + case-study enquiry forms.
create table if not exists contact_submissions (
  id          bigint generated always as identity primary key,
  name        text not null,
  email       text not null,
  phone       text,
  company     text,
  subject     text,
  message     text not null,
  routing     text,                 -- e.g. "service:seo" / "project:best4travel"
  source_url  text,                 -- page the form was submitted from
  user_agent  text,
  created_at  timestamptz not null default now()
);
create index if not exists contact_submissions_created_idx on contact_submissions (created_at desc);

-- Newsletter sign-ups (footer).
create table if not exists newsletter_subscribers (
  id          bigint generated always as identity primary key,
  email       text not null unique,
  source_url  text,
  created_at  timestamptz not null default now()
);

-- Event register-of-interest.
create table if not exists event_registrations (
  id          bigint generated always as identity primary key,
  event       text not null,        -- event id, e.g. "diarmuid-mcsweeney-gym-coffee"
  name        text not null,
  email       text not null,
  company     text,
  question    text,                 -- "anything you'd like the speaker to cover?"
  source_url  text,
  user_agent  text,
  created_at  timestamptz not null default now()
);
create index if not exists event_registrations_event_idx on event_registrations (event, created_at desc);
