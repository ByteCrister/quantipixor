import OcrDocFormatterPage from '@/components/image/ocr-doc-formatter/OcrDocFormatterPage'
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OCR Document Formatter",
  description:
    "Extract and format text from images using AI-powered OCR. Powered by Google Gemini and OCR.Space — convert scanned documents and photos into clean, structured text.",
  keywords: [
    "OCR online", "image to text", "extract text from image",
    "document formatter", "Google Gemini OCR", "scan to text",
  ],
  alternates: { canonical: "/og-images/og-ocr-formatter.png" },
  openGraph: {
    url: "/og-images/og-ocr-formatter.png",
    title: "OCR Document Formatter | Quantipixor",
    description:
      "Extract and format text from images with AI-powered OCR. Powered by Google Gemini and OCR.Space.",
  },
};

const Page = () => {
  return <OcrDocFormatterPage />
}

export default Page