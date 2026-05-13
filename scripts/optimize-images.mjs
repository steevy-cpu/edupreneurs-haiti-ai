/**
 * Generates resized WebP variants for all oversized Eric/Jude illustrations.
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
const PUBLIC = path.join(ROOT, "public/images");
const OUTPUT = PUBLIC;

await mkdir(OUTPUT, { recursive: true });

const variants = [
  // ── ROUND 1 ─────────────────────────────────────────────────────────────────

  // eric-celebrating: hero character (displayed up to 500px wide)
  { src: ASSETS, input: "eric-celebrating.png", width: 400, out: "eric-celebrating-400w.webp", quality: 75 },
  { src: ASSETS, input: "eric-celebrating.png", width: 600, out: "eric-celebrating-600w.webp", quality: 75 },
  { src: ASSETS, input: "eric-celebrating.png", width: 800, out: "eric-celebrating-800w.webp", quality: 75 },

  // eric-chair-desk: Jude avatar (displayed 32–96px)
  { src: ASSETS, input: "eric-chair-desk.png", width: 200, out: "eric-chair-desk-200w.webp", quality: 75 },
  { src: ASSETS, input: "eric-chair-desk.png", width: 400, out: "eric-chair-desk-400w.webp", quality: 75 },
  { src: ASSETS, input: "eric-chair-desk.png", width: 600, out: "eric-chair-desk-600w.webp", quality: 75 },

  // edupreneurs-new-logo: site logo (displayed 32–80px)
  { src: ASSETS, input: "edupreneurs-new-logo.png", width:  64, out: "edupreneurs-new-logo-64w.webp",  quality: 80 },
  { src: ASSETS, input: "edupreneurs-new-logo.png", width: 128, out: "edupreneurs-new-logo-128w.webp", quality: 80 },
  { src: ASSETS, input: "edupreneurs-new-logo.png", width: 256, out: "edupreneurs-new-logo-256w.webp", quality: 80 },

  // ── ROUND 2 — dashboard & interior pages ───────────────────────────────────

  // dashboard00: Jude chatbot floating widget (displayed max 112px)
  { src: ASSETS, input: "dashboard00.png", width: 200, out: "dashboard00-200w.webp", quality: 75 },
  { src: ASSETS, input: "dashboard00.png", width: 400, out: "dashboard00-400w.webp", quality: 75 },

  // auth00: auth sidebar Eric (displayed max 144px)
  { src: ASSETS, input: "auth00.png", width: 200, out: "auth00-200w.webp", quality: 75 },
  { src: ASSETS, input: "auth00.png", width: 400, out: "auth00-400w.webp", quality: 75 },

  // eric-404: 404 page + battle results (displayed max 192px)
  { src: ASSETS, input: "eric-404.png", width: 200, out: "eric-404-200w.webp", quality: 75 },
  { src: ASSETS, input: "eric-404.png", width: 400, out: "eric-404-400w.webp", quality: 75 },

  // Subject images (CourseHeader, DynamicLessonPage — displayed max 256px)
  { src: ASSETS, input: "eric-biologist.png",  width: 300, out: "eric-biologist-300w.webp",  quality: 75 },
  { src: ASSETS, input: "eric-biologist.png",  width: 500, out: "eric-biologist-500w.webp",  quality: 75 },
  { src: ASSETS, input: "eric-scientist.png",  width: 300, out: "eric-scientist-300w.webp",  quality: 75 },
  { src: ASSETS, input: "eric-scientist.png",  width: 500, out: "eric-scientist-500w.webp",  quality: 75 },
  { src: ASSETS, input: "eric-computer.png",   width: 300, out: "eric-computer-300w.webp",   quality: 75 },
  { src: ASSETS, input: "eric-computer.png",   width: 500, out: "eric-computer-500w.webp",   quality: 75 },
  { src: ASSETS, input: "eric-math.png",       width: 300, out: "eric-math-300w.webp",       quality: 75 },
  { src: ASSETS, input: "eric-math.png",       width: 500, out: "eric-math-500w.webp",       quality: 75 },
  { src: ASSETS, input: "eric-edupreneurs.png",width: 300, out: "eric-edupreneurs-300w.webp",quality: 75 },
  { src: ASSETS, input: "eric-edupreneurs.png",width: 500, out: "eric-edupreneurs-500w.webp",quality: 75 },

  // eric-new-profile: exam hub header (displayed max 256px)
  { src: ASSETS, input: "eric-new-profile.png", width: 300, out: "eric-new-profile-300w.webp", quality: 75 },
  { src: ASSETS, input: "eric-new-profile.png", width: 500, out: "eric-new-profile-500w.webp", quality: 75 },

  // eric-thinking-pose: chess + overlays (displayed max 128px)
  { src: ASSETS, input: "eric-thinking-pose.png", width: 200, out: "eric-thinking-pose-200w.webp", quality: 75 },
  { src: ASSETS, input: "eric-thinking-pose.png", width: 400, out: "eric-thinking-pose-400w.webp", quality: 75 },

  // eric-pointing-up: PWA prompt + push permission (displayed max 96px)
  { src: ASSETS, input: "eric-pointing-up.png", width: 100, out: "eric-pointing-up-100w.webp", quality: 75 },
  { src: ASSETS, input: "eric-pointing-up.png", width: 200, out: "eric-pointing-up-200w.webp", quality: 75 },
  { src: ASSETS, input: "eric-pointing-up.png", width: 400, out: "eric-pointing-up-400w.webp", quality: 75 },

  // eric-student-desk: chatbot + welcome overlays (displayed max 192px)
  { src: ASSETS, input: "eric-student-desk.png", width: 200, out: "eric-student-desk-200w.webp", quality: 75 },
  { src: ASSETS, input: "eric-student-desk.png", width: 400, out: "eric-student-desk-400w.webp", quality: 75 },

  // eric-thumb-up: avatar generation step (displayed max 144px)
  { src: ASSETS, input: "eric-thumb-up.png", width: 200, out: "eric-thumb-up-200w.webp", quality: 75 },
  { src: ASSETS, input: "eric-thumb-up.png", width: 400, out: "eric-thumb-up-400w.webp", quality: 75 },

  // eric-waving: welcome screen + onboarding (displayed max 192px)
  { src: ASSETS, input: "eric-waving.png", width: 200, out: "eric-waving-200w.webp", quality: 75 },
  { src: ASSETS, input: "eric-waving.png", width: 400, out: "eric-waving-400w.webp", quality: 75 },

  // eric-main01: affiliations + onboarding + settings (displayed max 160px)
  { src: ASSETS, input: "eric-main01.png", width: 200, out: "eric-main01-200w.webp", quality: 75 },
  { src: ASSETS, input: "eric-main01.png", width: 400, out: "eric-main01-400w.webp", quality: 75 },

  // jude-passion-discovery: passion discovery page (displayed max 256px)
  { src: ASSETS, input: "jude-passion-discovery.png", width: 300, out: "jude-passion-discovery-300w.webp", quality: 75 },
  { src: ASSETS, input: "jude-passion-discovery.png", width: 500, out: "jude-passion-discovery-500w.webp", quality: 75 },

  // edupreneur-watermark-patterns: CSS background tile at 300px
  { src: ASSETS, input: "edupreneur-watermark-patterns.png", width: 400, out: "edupreneur-watermark-patterns-400w.webp", quality: 75 },

  // edupreneurs-bg: full-width background (lazy, fast connection only)
  { src: ASSETS, input: "edupreneurs-bg.png", width: 800, out: "edupreneurs-bg-800w.webp", quality: 75 },

  // ── PUBLIC/IMAGES sources (already static, need smaller WebP variants) ──────

  // eric-ai-helper: Jude chat avatar (displayed max 96px)
  { src: PUBLIC, input: "eric-ai-helper.png", width: 100, out: "eric-ai-helper-100w.webp", quality: 75 },
  { src: PUBLIC, input: "eric-ai-helper.png", width: 200, out: "eric-ai-helper-200w.webp", quality: 75 },
  { src: PUBLIC, input: "eric-ai-helper.png", width: 400, out: "eric-ai-helper-400w.webp", quality: 75 },

  // eric-right-pointing: Matieres page (displayed max 192px)
  { src: PUBLIC, input: "eric-right-pointing.png", width: 200, out: "eric-right-pointing-200w.webp", quality: 75 },
  { src: PUBLIC, input: "eric-right-pointing.png", width: 400, out: "eric-right-pointing-400w.webp", quality: 75 },

  // jude-passion-discovery (public copy): same output as ASSETS version above — skipped
];

let totalOriginalKB = 0;
let totalNewKB = 0;

console.log("\nGenerating WebP variants...\n");

// Track which input files we've already counted for size reporting
const countedInputs = new Set();

for (const v of variants) {
  const inputPath = path.join(v.src, v.input);
  const outputPath = path.join(OUTPUT, v.out);

  await sharp(inputPath)
    .resize(v.width)
    .webp({ quality: v.quality })
    .toFile(outputPath);

  const { size } = await stat(outputPath);
  const kb = Math.round(size / 1024);
  totalNewKB += kb;
  console.log(`  ✓ ${v.out.padEnd(48)} ${kb} KB`);

  const key = `${v.src}/${v.input}`;
  if (!countedInputs.has(key)) {
    countedInputs.add(key);
    const { size: origSize } = await stat(inputPath);
    totalOriginalKB += Math.round(origSize / 1024);
  }
}

console.log(`\nOriginal PNGs total: ${totalOriginalKB} KB`);
console.log(`New WebP variants total: ${totalNewKB} KB`);
console.log(`Saved: ${totalOriginalKB - totalNewKB} KB (${Math.round((1 - totalNewKB / totalOriginalKB) * 100)}%)\n`);
