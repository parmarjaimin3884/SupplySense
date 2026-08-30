import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "@tanstack/react-query", "axios"],
  },
};

export default nextConfig;
