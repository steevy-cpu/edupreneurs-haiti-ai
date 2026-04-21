/**
 * Adds loading="lazy" decoding="async" to all <img> tags
 * that don't already have a loading= attribute.
 *
 * Exclusions (above-the-fold / LCP images already handled):
 * - src/components/home/HeroSection.tsx  (loading="eager" fetchPriority="high")
 * - src/components/home/HeaderNav.tsx    (loading="eager" fetchPriority="high")
 * - src/auth/layout/AuthHeader.tsx
 */

import { readFile, writeFile, readdir, stat } from 'fs/promises';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = resolve(__dirname, '..');
const srcDir = join(projectRoot, 'src');

const EXCLUDED = new Set([
  'src/components/home/HeroSection.tsx',
  'src/components/home/HeaderNav.tsx',
  'src/auth/layout/AuthHeader.tsx',
]);

let totalFilesModified = 0;
let totalImgsUpdated = 0;
let totalExclusions = 0;

/**
 * Adds loading="lazy" decoding="async" to <img> tags without loading=
 * Handles multiline <img> tags by matching from <img to the closing >
 */
function addLazyLoading(content, filePath) {
  let modified = false;
  let imgsUpdated = 0;

  // Match <img ... > — handles multiline, stops at first unescaped >
  // We need to match the full img tag to check if loading= is already present
  const imgTagRegex = /<img\b([^>]*(?:>(?!\/)|[^/])*?\/)?>|<img\b([^>]*)>/gs;

  const newContent = content.replace(/<img(\s[^>]*)?>/gs, (match, attrs) => {
    // If already has loading= attribute, skip
    if (match.includes('loading=')) {
      return match;
    }

    imgsUpdated++;
    modified = true;

    // Insert lazy loading attributes right after <img
    return match.replace('<img', '<img\n          loading="lazy"\n          decoding="async"');
  });

  // Also handle self-closing <img ... />
  const result = newContent.replace(/<img(\s[^>]*)\/>/gs, (match) => {
    if (match.includes('loading=')) return match;
    // Already handled above via the non-self-closing regex — count only if not already modified
    return match;
  });

  return { content: newContent, modified, imgsUpdated };
}

async function processFile(filePath) {
  const relativePath = filePath.replace(projectRoot + '/', '');

  if (EXCLUDED.has(relativePath)) {
    totalExclusions++;
    return;
  }

  const original = await readFile(filePath, 'utf8');

  // Quick check — skip if no unhandled img tags
  if (!/<img\b/i.test(original)) return;
  // Skip if all img tags already have loading=
  const imgCount = (original.match(/<img\b/gi) || []).length;
  const loadingCount = (original.match(/<img[^>]*loading=/gi) || []).length;
  if (imgCount === loadingCount) return;

  const { content, modified, imgsUpdated } = addLazyLoading(original, filePath);

  if (modified && content !== original) {
    await writeFile(filePath, content, 'utf8');
    console.log(`✓ ${relativePath}: +${imgsUpdated} lazy`);
    totalFilesModified++;
    totalImgsUpdated += imgsUpdated;
  }
}

async function walkDir(dir) {
  const entries = await readdir(dir);
  for (const entry of entries) {
    if (entry.startsWith('.') || entry.startsWith('._')) continue;
    const fullPath = join(dir, entry);
    const stats = await stat(fullPath);
    if (stats.isDirectory()) {
      await walkDir(fullPath);
    } else if (entry.endsWith('.tsx')) {
      await processFile(fullPath);
    }
  }
}

await walkDir(srcDir);

console.log(`\n═══════════════════════════════════`);
console.log(`✅ Lazy loading done`);
console.log(`   Files modified: ${totalFilesModified}`);
console.log(`   <img> updated:  ${totalImgsUpdated}`);
console.log(`   Exclusions:     ${totalExclusions} files (above-the-fold preserved)`);
console.log(`═══════════════════════════════════`);
