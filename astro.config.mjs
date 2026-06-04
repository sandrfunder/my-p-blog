// @ts-check
import { defineConfig } from "astro/config"

// integrations
import tailwindcss from "@tailwindcss/vite"
import mdx from "@astrojs/mdx"
import icon from "astro-icon"
import sitemap from "@astrojs/sitemap"

// Expressive Code
import expressiveCode from "astro-expressive-code"

// https://astro.build/config
export default defineConfig({
  devToolbar: {
    enabled: false,
  },
  integrations: [
    expressiveCode({
      themes: ["github-dark"],
    }),
    mdx(),
    icon(),
    sitemap(),
  ],
  prefetch: {
    defaultStrategy: "viewport",
    prefetchAll: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
