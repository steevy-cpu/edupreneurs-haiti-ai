import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

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
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimizations for production - especially 3G connections
    minify: 'esbuild',
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
          // Radix UI components - load on demand
          if (id.includes('@radix-ui/')) {
            return 'ui-radix';
          }
          // Framer motion - heavy, defer
          if (id.includes('framer-motion')) {
            return 'motion';
          }
          // Charts - only needed on specific pages
          if (id.includes('recharts')) {
            return 'charts';
          }
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
