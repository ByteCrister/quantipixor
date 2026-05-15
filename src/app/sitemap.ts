import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const domain =
    process.env.NEXT_PUBLIC_DOMAIN?.replace(/\/$/, "") ||
    "https://quantipixor.vercel.app";

  const routes = [
    { path: "/", priority: 1.0 },
    { path: "/mock/json-viewer", priority: 0.9 },
    { path: "/mock/profile", priority: 0.9 },
    { path: "/image/resize", priority: 0.9 },
    { path: "/image/converter", priority: 0.9 },
    { path: "/image/remove-bg", priority: 0.9 },
    { path: "/image/batch-compressor", priority: 0.9 },
    { path: "/image/generate-favicon", priority: 0.8 },
    { path: "/image/ocr-doc-formatter", priority: 0.8 },
    { path: "/about", priority: 0.7 },
    { path: "/help", priority: 0.7 },
  ];

  return routes.map((route) => ({
    url: `${domain}${route.path}`,
    lastModified: new Date(),
    changeFrequency: "monthly", // or "weekly" for frequently updated tools
    priority: route.priority,
  }));
}