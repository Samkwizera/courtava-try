import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

import { cloudflare } from "@cloudflare/vite-plugin";

const isDev = process.env.NODE_ENV !== "production";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), ...(isDev ? [componentTagger()] : []), VitePWA({
    registerType: "autoUpdate",
    includeAssets: ["courtava-icon.png", "pwa-192x192.png", "pwa-512x512.png"],
    manifest: {
      name: "Courtava - Basketball Community",
      short_name: "Courtava",
      description: "Find courts, join games, and connect with basketball players near you",
      theme_color: "#7AC943",
      background_color: "#f8f8f8",
      display: "standalone",
      orientation: "portrait",
      scope: "/",
      start_url: "/",
      icons: [
        {
          src: "pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
      ],
    },
    workbox: {
      navigateFallbackDenylist: [/^\/~oauth/],
      globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: "CacheFirst",
          options: {
            cacheName: "google-fonts-cache",
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365,
            },
          },
        },
      ],
    },
  }), cloudflare()],
  build: {
    chunkSizeWarningLimit: 1800,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "supabase-vendor": ["@supabase/supabase-js"],
          "query-vendor": ["@tanstack/react-query"],
          "mapbox-vendor": ["mapbox-gl", "@mapbox/mapbox-gl-geocoder"],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
