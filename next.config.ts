import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    AMAP_KEY: process.env.AMAP_KEY,
    NEXT_PUBLIC_SBASE_URL: process.env.NEXT_PUBLIC_SBASE_URL,
    NEXT_PUBLIC_SBASE_API_KEY: process.env.NEXT_PUBLIC_SBASE_API_KEY,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
};

export default nextConfig;
