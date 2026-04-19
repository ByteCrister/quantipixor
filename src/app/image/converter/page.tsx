import ImageConverterPage from "@/components/image/converter/ImageConverterPage"
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Converter",
  description:
    "Convert images between JPG, PNG, WebP, AVIF, and more — free and entirely in your browser. No uploads, no data stored.",
  keywords: [
    "image converter", "convert jpg to webp", "convert png to avif",
    "online image format converter", "free image converter",
  ],
  alternates: { canonical: "/image/converter" },
  openGraph: {
    url: "/og-images/og-image-converter.png",
    title: "Image Converter | Quantipixor",
    description:
      "Convert images between JPG, PNG, WebP, AVIF and more — free, private, and in-browser.",
  },
};

const page = () => {
  return <ImageConverterPage />
}

export default page