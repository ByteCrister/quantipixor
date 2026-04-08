import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Ensure Vercel bundles native ONNX Runtime binaries needed by `onnxruntime-node`.
  // Without this, serverless output tracing can omit `onnxruntime_binding.node` and
  // its dependent shared libraries (e.g. `libonnxruntime.so.1`), causing runtime import failures.
  outputFileTracingIncludes: {
    // Apply to all routes (safe, small-ish inclusion).
    // Next expects globs relative to project root.
    "/*": ["node_modules/onnxruntime-node/bin/**"],
  },
  // webpack(config, { isServer }) {
    // Ensure worker files are handled correctly
  //   if (!isServer) {
  //     config.resolve.fallback = {
  //       ...config.resolve.fallback,
  //       fs: false,
  //       path: false,
  //     };
  //   }
  //   return config;
  // },
};

export default nextConfig;
