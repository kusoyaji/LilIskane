import type { NextConfig } from "next";

const config: NextConfig = {
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
