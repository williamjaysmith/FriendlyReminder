import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Clean config for Appwrite
  transpilePackages: [],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
