// Single Postgres connection for server endpoints. Works with any Postgres host
// that gives a connection string (Vercel Postgres, Supabase, Neon, RDS...).
// Set DATABASE_URL in the environment. If it's missing, db() returns null and
// callers fall back gracefully (so a missing env never 500s a form silently).
import postgres from "postgres";

const url = process.env.DATABASE_URL;

let sql: ReturnType<typeof postgres> | null = null;
if (url) {
  sql = postgres(url, {
    // Most managed Postgres hosts require TLS; allow self-signed for poolers.
    ssl: url.includes("sslmode=disable") ? false : "require",
    max: 3,
    idle_timeout: 20,
    connect_timeout: 10,
  });
}

export function db() {
  return sql;
}

export const hasDb = !!sql;
