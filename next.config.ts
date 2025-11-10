// next.config.ts
import type { NextConfig } from 'next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Next 16: use top-level `turbopack` (not experimental)
  turbopack: {
    root: ROOT, // absolute path to your repo root
  },
};

export default nextConfig;
