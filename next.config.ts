import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude Supabase functions from compilation
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    return config;
  },
  // Ignore supabase folder during build
  transpilePackages: [],
  experimental: {
    outputFileTracingIgnores: ['supabase/**/*'],
  },
};

export default nextConfig;
