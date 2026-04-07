import type { Metadata } from "next";
import Landing from "@/components/landing/Landing";
import { SOCIAL_LINKS } from "@/const/social-links";

const CREATOR_NAME = "Sadiqul Islam Shakib";

const seoTitle =
  "Quantipixor — Free Private Batch Image Compressor | Compress JPG, PNG, WebP & AVIF Online";

const seoDescription =
  "Compress and optimize JPG, PNG, WebP, AVIF and more in bulk — entirely in your browser. Quantipixor is 100 % free, requires no uploads, and keeps every image private. Download results as organized ZIP archives.";

export const metadata: Metadata = {
  title: {
    absolute: seoTitle,
  },
  description: seoDescription,

  keywords: [
    "image compression",
    "compress images online",
    "batch image compressor",
    "bulk image optimizer",
    "webp converter",
    "avif compressor",
    "jpeg optimizer",
    "png compression",
    "reduce image file size",
    "client-side image compression",
    "private image compression",
    "compress images without upload",
    "free image compressor",
    "browser image optimizer",
    "zip download images",
    "Quantipixor",
  ],

  authors: [{ name: CREATOR_NAME, url: SOCIAL_LINKS.LINKEDIN }],
  creator: CREATOR_NAME,
  publisher: CREATOR_NAME,

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Quantipixor",
    title: seoTitle,
    description: seoDescription,
    images: [{ url: "/og-images/og-landing-page.png", width: 1200, height: 630, alt: "Quantipixor home — batch image compression in your browser" }],  
  },

  twitter: {
    card: "summary_large_image",
    title: seoTitle,
    description: seoDescription,
    // creator: "@your_twitter_handle",  
    // images: ["/og-home.png"],  
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },

  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  const siteOrigin =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteOrigin}/#website`,
        name: "Quantipixor",
        url: siteOrigin,
        description: seoDescription,
        author: { "@id": `${siteOrigin}/#person` },
      },
      {
        "@type": "SoftwareApplication",
        name: "Quantipixor",
        url: siteOrigin,
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Any (browser-based)",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description: seoDescription,
        author: { "@id": `${siteOrigin}/#person` },
      },
      {
        "@type": "Person",
        "@id": `${siteOrigin}/#person`,
        name: CREATOR_NAME,
        url: SOCIAL_LINKS.LINKEDIN,
        sameAs: [SOCIAL_LINKS.GITHUB, SOCIAL_LINKS.LINKEDIN],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Landing />
    </>
  );
}
