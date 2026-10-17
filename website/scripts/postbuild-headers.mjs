// Post-build: add baseline security headers to every response.
// The @astrojs/vercel adapter writes the Build Output API config itself, and
// Vercel does not read vercel.json "headers" for prebuilt output, so the rule
// is injected into .vercel/output/config.json instead. No strict CSP here:
// only frame-ancestors, so third-party embeds keep working. HSTS leaves out
// includeSubDomains so no other subdomain on the apex is forced onto HTTPS.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const file = new URL('../.vercel/output/config.json', import.meta.url);
if (!existsSync(file)) {
  console.log('[postbuild-headers] no .vercel/output, skipping (non-Vercel build)');
  process.exit(0);
}
const config = JSON.parse(readFileSync(file, 'utf8'));
const MARK = 'x-r22-security-headers';
config.routes = (config.routes ?? []).filter((r) => !r[MARK]);
config.routes.unshift({
  src: '^/(.*)$',
  headers: {
    'Strict-Transport-Security': 'max-age=63072000',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'SAMEORIGIN',
    'Content-Security-Policy': "frame-ancestors 'self'",
  },
  continue: true,
});
writeFileSync(file, JSON.stringify(config, null, '\t'));
console.log('[postbuild-headers] security headers route injected');
