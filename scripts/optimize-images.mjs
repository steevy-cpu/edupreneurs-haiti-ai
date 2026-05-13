/**
 * Generates resized WebP variants for the three oversized images.
 * Output goes to public/images/ so they're served as static assets.
 *
 * Usage: node scripts/optimize-images.mjs
 */
import sharp from "sharp";
import { stat, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const ASSETS = path.join(ROOT, "src/assets");
const OUTPUT = path.join(ROOT, "public/images");

await mkdir(OUTPUT, { recursive: true });

const variants = [
  // ── eric-celebrating: hero character (displayed up to 500px wide) ──────────
  { input: "eric-celebrating.png", width: 400, out: "eric-celebrating-400w.webp", quality: 75 },
  { input: "eric-celebrating.png", width: 600, out: "eric-celebrating-600w.webp", quality: 75 },
  { input: "eric-celebrating.png", width: 800, out: "eric-celebrating-800w.webp", quality: 75 },

  // ── eric-chair-desk: Jude avatar (displayed 32–96px) ─────────────────────
  { input: "eric-chair-desk.png", width: 200, out: "eric-chair-desk-200w.webp", quality: 75 },
  { input: "eric-chair-desk.png", width: 400, out: "eric-chair-desk-400w.webp", quality: 75 },
  { input: "eric-chair-desk.png", width: 600, out: "eric-chair-desk-600w.webp", quality: 75 },

  // ── edupreneurs-new-logo: site logo (displayed 32–80px) ──────────────────
  { input: "edupreneurs-new-logo.png", width: 64,  out: "edupreneurs-new-logo-64w.webp",  quality: 80 },
  { input: "edupreneurs-new-logo.png", width: 128, out: "edupreneurs-new-logo-128w.webp", quality: 80 },
  { input: "edupreneurs-new-logo.png", width: 256, out: "edupreneurs-new-logo-256w.webp", quality: 80 },
];

let totalOriginalKB = 0;
let totalNewKB = 0;

console.log("\nGenerating WebP variants...\n");

for (const v of variants) {
  const inputPath = path.join(ASSETS, v.input);
  const outputPath = path.join(OUTPUT, v.out);

  await sharp(inputPath)
    .resize(v.width)
    .webp({ quality: v.quality })
    .toFile(outputPath);

  const { size } = await stat(outputPath);
  const kb = Math.round(size / 1024);
  totalNewKB += kb;
  console.log(`  ✓ ${v.out.padEnd(40)} ${kb} KB`);
}

// Report original sizes for comparison
const originals = [...new Set(variants.map((v) => v.input))];
for (const name of originals) {
  const { size } = await stat(path.join(ASSETS, name));
  const kb = Math.round(size / 1024);
  totalOriginalKB += kb;
}

console.log(`\nOriginal PNGs total: ${totalOriginalKB} KB`);
console.log(`New WebP variants total: ${totalNewKB} KB`);
console.log(`Saved: ${totalOriginalKB - totalNewKB} KB (${Math.round((1 - totalNewKB / totalOriginalKB) * 100)}%)\n`);
