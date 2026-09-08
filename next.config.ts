import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Same-origin media must retain the viewer's authenticated request.
  images: { unoptimized: true },
};

export default nextConfig;
