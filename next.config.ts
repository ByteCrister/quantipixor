import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Do NOT include onnxruntime-node binaries – you use WASM
  // outputFileTracingIncludes should be removed or left empty.

  // Instead, externalize heavy packages to keep function size small
  serverExternalPackages: [
    "@huggingface/transformers",
    "onnxruntime-node", // this package won't be bundled, its native binaries are ignored
    "sharp",
  ],
  experimental: {
    serverComponentsExternalPackages: [
      "@huggingface/transformers",
      "onnxruntime-node",
    ],
  },
};

export default nextConfig;