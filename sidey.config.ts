// sidey.config.ts

export const sideyConfig = {
  /**
   * Global SEO and Site Identity
   * -------------------------------------------------------------------------
   * These values populate your HTML meta tags, RSS feed definitions,
   * and structural header components across the template.
   */
  site: {
    // The main title displayed in browser tabs and search engine results
    title: "Alisa Kshutashvili",

    // A short fallback summary of your site used for SEO and social share cards
    description: "An entrepreneur, minimalist, and human.",

    // The production domain where your site is deployed (no trailing slash)
    url: "https://kshutashvili.com",

    // Your name, utilized in copyright strings and author meta tags
    author: "Alisa Kshutashvili",

    // The primary language attribute for HTML accessibility engines (e.g., "en", "id")
    locale: "en",
  },

  /**
   * Primary Sidebar Navigation
   * -------------------------------------------------------------------------
   * Controls the links rendered inside your fixed navigation panel.
   * You can add, reorder, or remove objects here to update your site's structure.
   */
  navigation: [
    { label: "Home", href: "/" },
    { label: "Writings", href: "/writings" },
    { label: "About", href: "/about" },
    { label: "RSS", href: "/rss.xml" },
  ],

  /**
   * Social Links
   * -------------------------------------------------------------------------
   * Social media links displayed in the sidebar with icons.
   */
  social: [
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/kshutashvili/",
      icon: "simple-icons:linkedin",
    },
  ],
}

export type SideyConfigType = typeof sideyConfig
