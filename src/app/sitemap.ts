import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const domain =
        process.env.NEXT_PUBLIC_DOMAIN?.replace(/\/$/, "") ||
        "https://quantipixor.vercel.app";

    const routes = [
        { path: "/", priority: 1.0 },
        { path: "/image/batch-compressor", priority: 0.9 },
        { path: "/image/generate-favicon", priority: 0.9 },
        { path: "/about", priority: 0.9 },
        { path: "/help", priority: 0.85 },
    ];

    return routes.map((route) => ({
        url: `${domain}${route.path}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: route.priority,
    }));
}