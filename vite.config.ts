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
  cacheDir: "node_modules/.vite-edupreneurs",
  optimizeDeps: {
    // Avoid using any previously prebundled react-chessboard that may require React 19's `use`
    exclude: ["react-chessboard"],
    // Ensure next-themes uses the same React instance as the rest of the app
    include: ["next-themes"],
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
      // PNG - aggressive compression for 3G
      png: {
        quality: 65,
        compressionLevel: 9,
        palette: true,
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
      // Cache optimization results between builds
      cache: true,
      cacheLocation: 'node_modules/.cache/image-optimizer',
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
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
          // React core - smallest possible initial bundle
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-core';
          }
          // Router separate for code splitting
          if (id.includes('react-router')) {
            return 'router';
          }
          // Supabase client
          if (id.includes('@supabase/')) {
            return 'supabase';
          }
          // TanStack Query
          if (id.includes('@tanstack/')) {
            return 'query';
          }
          // Note: Removed aggressive chunking for radix-ui, framer-motion, and recharts
          // These libraries have internal circular dependencies that cause TDZ errors when manually split
          // Chess - only needed on chess page
          if (id.includes('chess') || id.includes('react-chessboard')) {
            return 'chess';
          }
          // 3D/Three.js - only needed for 3D features
          if (id.includes('three') || id.includes('@react-three/')) {
            return 'three';
          }
        },
      },
    },
    // Reduce chunk size for faster loading on 3G
    chunkSizeWarningLimit: 300,
  },
}));
