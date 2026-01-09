import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // reactCompiler: true,

  // Fix for multiple lockfiles warning causing Turbopack panic
  // Explicitly tell Turbopack to look only in the current project root
  turbopack: {
    root: process.cwd(),
  },
} as NextConfig; // Type assertion in case types are not yet updated for v16 properties

export default nextConfig;
