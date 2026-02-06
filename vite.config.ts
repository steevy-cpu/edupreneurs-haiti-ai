import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  // Force a fresh Vite dependency cache to avoid stale prebundled deps (e.g. react-chessboard)
  // Force fresh cache rebuild to clear stale React references
  cacheDir: "node_modules/.vite-edupreneurs-v3",
  optimizeDeps: {
    // Avoid using any previously prebundled react-chessboard that may require React 19's `use`
    exclude: ["react-chessboard"],
    // Ensure these packages use the same React instance as the rest of the app
    include: ["next-themes", "react-router-dom", "framer-motion"],
  },
  plugins: [
    react(),
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
    },
    // Force all packages to use the same React instance
    // Prevents "Cannot read properties of null (reading 'useState'/'useContext')" errors
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react-router", "react-router-dom", "framer-motion"],
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
}));
