/**
 * WebP conversion script for Edupreneurs Haiti
 * Converts PNG/JPG > 500KB to WebP at quality 82
 * Originals are kept as fallback — this script is ADDITIVE only
 *
 * Run: node --require module scripts/optimize-images.mjs
 * (uses sharp from npx cache)
 */

import { createRequire } from 'module';
import { readdir, stat } from 'fs/promises';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = resolve(__dirname, '..');

// Use sharp from npx cache (no permanent install needed)
const SHARP_MODULES = '/Users/steevecelestin/.npm/_npx/8eaa2fd4331c2509/node_modules';
const require = createRequire(import.meta.url);

let sharp;
try {
  // Try to require from npx cache
  const Module = require('module');
  const originalPaths = Module._nodeModulePaths(projectRoot);
  Module._resolveFilename = ((original) => (request, parent, isMain, options) => {
    return original(request, parent, isMain, options);
  })(Module._resolveFilename);

  // Direct require from cache path
  sharp = (await import(`file://${SHARP_MODULES}/sharp/lib/index.js`)).default;
} catch {
  // Fallback: try standard require with modified paths
  process.env.NODE_PATH = SHARP_MODULES;
  require('module').Module._initPaths();
  sharp = require('sharp');
}

const TARGETS = [
  join(projectRoot, 'src/assets'),
  join(projectRoot, 'public/images'),
];
const MIN_SIZE = 500 * 1024; // 500KB

let totalOriginalBytes = 0;
let totalWebpBytes = 0;
let filesProcessed = 0;
let filesSkipped = 0;

async function processDir(dir) {
  let entries;
  try {
    entries = await readdir(dir);
  } catch {
    console.log(`⚠ Directory not found: ${dir}`);
    return;
  }

  for (const file of entries) {
    const fullPath = join(dir, file);
    const stats = await stat(fullPath);

    if (stats.isDirectory()) {
      await processDir(fullPath);
      continue;
    }

    if (!/\.(png|jpe?g)$/i.test(file)) continue;
    if (stats.size < MIN_SIZE) {
      filesSkipped++;
      continue;
    }

    const webpPath = fullPath.replace(/\.(png|jpe?g)$/i, '.webp');

    // Skip if WebP already exists and is newer than source
    try {
      const webpStats = await stat(webpPath);
      if (webpStats.mtimeMs > stats.mtimeMs) {
        console.log(`↷ ${file}: WebP already up-to-date`);
        filesSkipped++;
        continue;
      }
    } catch {
      // WebP doesn't exist yet — proceed
    }

    try {
      await sharp(fullPath)
        .webp({ quality: 82, effort: 6 })
        .toFile(webpPath);

      const newStats = await stat(webpPath);
      const saving = ((1 - newStats.size / stats.size) * 100).toFixed(1);
      const origMB = (stats.size / 1024 / 1024).toFixed(2);
      const newMB = (newStats.size / 1024 / 1024).toFixed(2);

      console.log(`✓ ${file}: ${origMB}MB → ${newMB}MB (-${saving}%)`);

      totalOriginalBytes += stats.size;
      totalWebpBytes += newStats.size;
      filesProcessed++;
    } catch (err) {
      console.error(`✗ ${file}: ${err.message}`);
    }
  }
}

for (const dir of TARGETS) {
  console.log(`\n📁 Processing: ${dir.replace(projectRoot, '.')}`);
  await processDir(dir);
}

const totalOrigMB = (totalOriginalBytes / 1024 / 1024).toFixed(1);
const totalWebpMB = (totalWebpBytes / 1024 / 1024).toFixed(1);
const totalSaving = totalOriginalBytes > 0
  ? ((1 - totalWebpBytes / totalOriginalBytes) * 100).toFixed(1)
  : 0;

console.log(`\n═══════════════════════════════════`);
console.log(`✅ DONE`);
console.log(`   Converted: ${filesProcessed} files`);
console.log(`   Skipped:   ${filesSkipped} files (< 500KB or already up-to-date)`);
console.log(`   Before:    ${totalOrigMB} MB`);
console.log(`   After:     ${totalWebpMB} MB`);
console.log(`   Saving:    -${totalSaving}%`);
console.log(`═══════════════════════════════════`);
