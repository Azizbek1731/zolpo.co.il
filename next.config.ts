import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ship a self-contained server bundle for the Docker image.
  output: "standalone",
  // The repo lives inside a parent folder that also has a lockfile; pin the root
  // so Turbopack does not walk up and pick the wrong one.
  turbopack: { root: import.meta.dirname },
};

export default nextConfig;
