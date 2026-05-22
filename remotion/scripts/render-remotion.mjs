import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log("[render] bundling…");
const bundled = await bundle({
  entryPoint: path.resolve(__dirname, "../src/index.ts"),
  webpackOverride: (config) => config,
});

console.log("[render] launching headless chrome…");
const browser = await openBrowser("chrome", {
  browserExecutable: process.env.PUPPETEER_EXECUTABLE_PATH ?? "/bin/chromium",
  chromiumOptions: {
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  },
  chromeMode: "chrome-for-testing",
});

console.log("[render] selecting composition…");
const composition = await selectComposition({
  serveUrl: bundled,
  id: "main",
  puppeteerInstance: browser,
});

const out = process.argv[2] ?? "/mnt/documents/edupreneurs-promo-v1.mp4";
console.log(`[render] rendering → ${out}`);

// High-quality master: CRF 16 + preset slow + tune film for paper/teal gradients.
await renderMedia({
  composition,
  serveUrl: bundled,
  codec: "h264",
  outputLocation: out,
  puppeteerInstance: browser,
  muted: true,
  concurrency: 1,
  crf: 16,
  x264Preset: "slow",
  pixelFormat: "yuv420p",
  onProgress: ({ progress }) => {
    if (Math.floor(progress * 100) % 5 === 0) {
      process.stdout.write(`\r[render] ${Math.round(progress * 100)}%   `);
    }
  },
});

await browser.close({ silent: false });
console.log("\n[render] done");
