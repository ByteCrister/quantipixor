import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure Vercel bundles native ONNX Runtime binaries needed by `onnxruntime-node`.
  // Scope this to the remove-bg route to keep other serverless bundles small.
  outputFileTracingIncludes: {
    "/api/v1/remove-bg": ["./node_modules/onnxruntime-node/bin/**"],
  },
};

export default nextConfig;