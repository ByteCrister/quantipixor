import ImageResizerPage from "@/components/image/resize/ImageResizerPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Free Online Image Resizer",
    description:
        "Resize images to exact dimensions online – free and private. Batch resize multiple JPG, PNG, WebP, or GIF files. Lock aspect ratio, choose presets, and download all resized images instantly. No uploads, 100% browser‑based.",
    keywords: [
        "image resizer",
        "batch image resize",
        "resize image online free",
        "change image dimensions",
        "resize jpg",
        "resize png",
        "resize webp",
        "image scaling tool",
        "batch resize multiple images",
    ],
    openGraph: {
        title: "Free Online Image Resizer – Quantipixor",
        description:
            "Resize single or multiple images to any dimensions. Presets for HD, Full HD, 4K, and social media. All processing stays in your browser.",
        images: [{ url: "/og-images/og-image-resizer.png", width: 1200, height: 630, alt: "Quantipixor Image Resizer" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Free Online Image Resizer – Quantipixor",
        description:
            "Resize single or multiple images to any dimensions. Presets for HD, Full HD, 4K, and social media. All processing stays in your browser.",
        images: ["/og-images/og-resizer.png"],
    },
};

export default function Page() {
    return <ImageResizerPage />;
}