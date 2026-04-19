import FaviconGeneratorPage from "@/components/image/generate-favicon/FaviconGeneratorPage"
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Favicon Generator",
  description:
    "Generate a complete favicon set from any image — ICO, PNG, and Apple Touch Icon sizes. Free online favicon generator powered by Sharp.",
  keywords: [
    "favicon generator", "create favicon", "ico generator",
    "favicon from image", "apple touch icon", "free favicon maker",
  ],
  alternates: { canonical: "/og-images/og-favicon-generator.png" },
  openGraph: {
    url: "/og-images/og-favicon-generator.png",
    title: "Favicon Generator | Quantipixor",
    description:
      "Generate a complete favicon set (ICO, PNG, Apple Touch Icon) from any image — free online tool.",
  },
};

const page = () => {
  return <FaviconGeneratorPage />
}

export default page