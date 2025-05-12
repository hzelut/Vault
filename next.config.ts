import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    DATABASE_FILE: process.env.DATABASE_FILE,
    ADMIN_NAME: process.env.ADMIN_NAME,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_ALG: process.env.AUTH_ALG,
  },
};

export default nextConfig;
