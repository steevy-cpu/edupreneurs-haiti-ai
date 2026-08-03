import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import legacy from '@vitejs/plugin-legacy';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Preview safety net: Lovable Cloud normally injects these VITE_* values, but a
  // missing injection crashes @supabase/supabase-js during module import before
  // React can replace the static skeleton. The publishable key is safe in client code.
  const supabaseUrl = env.VITE_SUPABASE_URL || 'https://xdyavylcmucjpueybdku.supabase.co';
  const supabasePublishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkeWF2eWxjbXVjanB1ZXliZGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTIxODIsImV4cCI6MjA3NDk4ODE4Mn0.TU1dWtjyxFRpNVg3ePt4Kj9cUMpbXFfpsrNawIBv60o';

  return ({
  server: {
    host: "::",
    port: 8080,
  },
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
    'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(supabasePublishableKey),
    'import.meta.env.VITE_SUPABASE_PROJECT_ID': JSON.stringify(env.VITE_SUPABASE_PROJECT_ID || 'xdyavylcmucjpueybdku'),
  },
  // Force a fresh Vite dependency cache to avoid stale prebundled deps (e.g. react-chessboard).
  // Bump this namespace when preview serves mixed React chunks after dependency optimizer drift.
  cacheDir: "node_modules/.vite-edupreneurs-v5",
  optimizeDeps: {
    // Avoid using any previously prebundled react-chessboard that may require React 19's `use`
    exclude: ["react-chessboard"],
    // Ensure these packages use the same React instance as the rest of the app
    include: ["next-themes", "react-router-dom", "framer-motion"],
  },
  plugins: [
    react(),
    // Legacy bundle for old Android WebViews (2018-era phones in Haiti).
    // Modern browsers still load the fast es2020 module build untouched;
    // old browsers get a transpiled SystemJS bundle via nomodule + core-js polyfills.
    // NOTE: this plugin intentionally overrides build.target for its own output.
    // To REVERSE this change: delete this plugin entry, the import above, and the
    // @vitejs/plugin-legacy devDependency. Nothing else depends on it.
    legacy({
      targets: ['defaults', 'chrome >= 64', 'android >= 64'],
      modernPolyfills: false,
    }),
    mode === "development" && componentTagger(),
    // Build-time image optimization - tuned for 3G connections in Haiti
    ViteImageOptimizer({
      test: /\.(jpe?g|png|gif|tiff|webp|avif)$/i,
      includePublic: true,
      logStats: true,
      ansiColors: true,
      // Exclude transparent character images from optimization to preserve alpha
      exclude: [
        '**/jude-profile-transparent.png',
        '**/champion-transparent.png',
        '**/jude-passion-discovery.png',
      ],
      // PNG - compression for 3G (palette disabled to preserve transparency)
      png: {
        quality: 65,
        compressionLevel: 9,
        palette: false,
      },
      // JPEG - optimized for 3G bandwidth
      jpeg: {
        quality: 65,
        mozjpeg: true,
      },
      jpg: {
        quality: 65,
        mozjpeg: true,
      },
      // WebP - primary format for modern browsers on 3G
      webp: {
        lossless: false,
        quality: 65,
        alphaQuality: 70,
        effort: 6,
        smartSubsample: true,
      },
      // AVIF - maximum compression for slowest connections
      avif: {
        lossless: false,
        quality: 45,
        effort: 9,
        chromaSubsampling: '4:2:0',
      },
      // GIF optimization
      gif: {},
      // SVG optimization
      svg: {
        plugins: [
          'removeViewBox',
          'sortAttrs',
          'removeDimensions',
          'removeMetadata',
          'removeComments',
          'cleanupIds',
        ],
      },
      // Disable cache temporarily to force re-optimization with new settings
      cache: false,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Keep Vite optimized deps and app source on one React instance; duplicate React breaks hooks.
      "react": path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
      "react/jsx-runtime": path.resolve(__dirname, "./node_modules/react/jsx-runtime.js"),
      "react/jsx-dev-runtime": path.resolve(__dirname, "./node_modules/react/jsx-dev-runtime.js"),
    },
    // Force all packages to use the same React instance
    // Prevents "Cannot read properties of null (reading 'useState'/'useContext')" errors
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react-router", "react-router-dom", "framer-motion", "three", "@react-three/fiber"],
  },
  build: {
    // Optimizations for production - especially 3G connections
    // Use terser for better minification (saves ~58KB on chess bundle)
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      mangle: true,
      format: {
        comments: false,
      },
    },
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core + Router bundled together to prevent context issues
          // Router hooks (useLocation, useNavigate) require same React instance
          if (id.includes('node_modules/react/') || 
              id.includes('node_modules/react-dom/') ||
              id.includes('react-router')) {
            return 'react-core';
          }
          // Supabase client
          if (id.includes('@supabase/')) {
            return 'supabase';
          }
          // TanStack Query
          if (id.includes('@tanstack/')) {
            return 'query';
          }
          // Note: Removed aggressive chunking for radix-ui, framer-motion, recharts, chess, and three.js
          // These libraries have internal circular dependencies that cause TDZ errors when manually split
          // Let Vite handle chunking automatically for these libraries
        },
      },
    },
    // Reduce chunk size for faster loading on 3G
    chunkSizeWarningLimit: 300,
  },
  });
});
