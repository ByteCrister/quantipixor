import BatchCompressor from '@/components/image/batch-compressor/BatchCompressor'
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Batch Image Compressor",
    description:
        "Compress hundreds of JPG, PNG, WebP, and AVIF images at once — entirely in your browser. No uploads, no sign-ups, 100% private. Download results as a ZIP archive.",
    keywords: [
        "batch image compressor", "compress images online", "bulk image optimizer",
        "jpeg compressor", "png optimizer", "webp compressor", "avif compressor",
        "client-side compression", "private image compression",
    ],
    alternates: { canonical: "/image/batch-compressor" },
    openGraph: {
        url: "/og-images/og-batch-compressor.png",
        title: "Batch Image Compressor | Quantipixor",
        description:
            "Compress hundreds of images at once in your browser. No uploads required — 100% private.",
    },
};

const Page = () => {
    return <BatchCompressor />
}

export default Page