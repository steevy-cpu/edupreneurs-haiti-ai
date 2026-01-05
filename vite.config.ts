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
    // Optimizations for production
    minify: 'esbuild', // esbuild is faster and included by default
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'query-vendor': ['@tanstack/react-query'],
          'supabase-vendor': ['@supabase/supabase-js'],
        },
      },
    },
    // Increase chunk size warning limit (500kb)
    chunkSizeWarningLimit: 500,
  },
}));
