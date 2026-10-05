import type { NextConfig } from "next";

const config: NextConfig = {
  // The dev indicator (black "N") sat over the film disclaimer on phones and on
  // every screen during reviews. Off by config rather than hidden with CSS, so
  // the dev error overlay keeps working.
  devIndicators: false,
  images: {
    // AVIF first, WebP fallback. Sizes match the layout breakpoints in
    // src/styles/tokens.css so `sizes` attributes resolve to real candidates.
    formats: ["image/avif", "image/webp"],
    deviceSizes: [420, 640, 828, 1080, 1280, 1600, 1920, 2560],
    imageSizes: [96, 160, 240, 320],
  },
  experimental: {
    optimizePackageImports: [],
  },
};

export default config;
