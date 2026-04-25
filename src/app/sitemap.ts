import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://quantipixor.vercel.app";

  const routes = [
    "",
    "/image/converter",
    "/image/remove-bg",
    "/image/batch-compressor",
    "/image/generate-favicon",
    "/image/ocr-doc-formatter",
    "/about",
    "/help",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }));
}