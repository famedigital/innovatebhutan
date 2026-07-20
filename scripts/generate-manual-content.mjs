/**
 * Bundles docs/*.md referenced by lib/manual/catalog.ts into
 * lib/manual/content.generated.ts so serverless functions never fs-read
 * process.cwd() (which NFT-traced the whole repo → 329MB Vercel failure).
 *
 * Run: node scripts/generate-manual-content.mjs
 * Also hooked via package.json "prebuild".
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalogPath = path.join(root, "lib", "manual", "catalog.ts");
const outPath = path.join(root, "lib", "manual", "content.generated.ts");

const catalogSrc = fs.readFileSync(catalogPath, "utf8");
const pairs = [
  ...catalogSrc.matchAll(/slug:\s*"([^"]+)"[\s\S]*?file:\s*"([^"]+)"/g),
].map((m) => [m[1], m[2]]);

if (pairs.length === 0) {
  console.error("generate-manual-content: no slug/file pairs found in catalog");
  process.exit(1);
}

/** @type {Record<string, string>} */
const map = {};
const missing = [];

for (const [slug, rel] of pairs) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    missing.push(`${slug} → ${rel}`);
    map[slug] = `_Document file missing: \`${rel}\`._\n`;
    continue;
  }
  map[slug] = fs.readFileSync(full, "utf8");
}

const banner = `/**
 * AUTO-GENERATED — do not edit by hand.
 * Source: lib/manual/catalog.ts + docs/
 * Regenerate: node scripts/generate-manual-content.mjs
 */
`;

const body = `export const MANUAL_MD: Record<string, string> = ${JSON.stringify(
  map,
  null,
  2
)};\n`;

fs.writeFileSync(outPath, banner + body, "utf8");

const bytes = Buffer.byteLength(body, "utf8");
console.log(
  `generate-manual-content: ${pairs.length} pages → ${outPath} (${(bytes / 1024).toFixed(1)} KiB)`
);
if (missing.length) {
  console.warn("Missing files:\n ", missing.join("\n  "));
}
