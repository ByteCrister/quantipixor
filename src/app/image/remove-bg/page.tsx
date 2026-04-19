import RemoveBgPage from "@/components/image/remove-bg/RemoveBgPage"
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Background Removal",
  description:
    "Remove image backgrounds instantly using AI — free online tool. Upload your photo and get a clean, transparent PNG in seconds.",
  keywords: [
    "remove background", "background remover", "AI background removal",
    "transparent background", "remove bg online free",
  ],
  alternates: { canonical: "/og-images/og-bg-remover.png" },
  openGraph: {
    url: "/og-images/og-bg-remover.png",
    title: "AI Background Removal | Quantipixor",
    description:
      "Remove image backgrounds instantly with AI. Get a transparent PNG in seconds — free online tool.",
  },
};

const page = () => {
  return <RemoveBgPage />
}

export default page