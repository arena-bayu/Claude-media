import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // image Docker kecil (lihat Dockerfile)
  // Font slide dibaca dari disk saat runtime; pastikan ikut ke bundel standalone.
  outputFileTracingIncludes: { "/api/slides/**": ["./assets/fonts/**"] },
};

export default nextConfig;
