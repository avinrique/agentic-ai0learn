/** @type {import('next').NextConfig} */
// NEXT_DIST_DIR lets a preview dev server build into its own folder without
// touching the production build in .next.
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
};

export default nextConfig;
