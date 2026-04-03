import type { Metadata } from "next";
import Landing from "@/components/landing/Landing";
import { SOCIAL_LINKS } from "@/const/social-links";

const CREATOR_NAME = "Sadiqul Islam Shakib";

const seoDescription =
  "Compress JPG, PNG, WebP, AVIF, and more in bulk without uploads. Quantipixor runs entirely in your browser for fast, private image optimization and ZIP download.";

const seoTitle =
  "Quantipixor — Private batch image compression in your browser";

export const metadata: Metadata = {
  title: {
    absolute: seoTitle,
  },
  description: seoDescription,
  keywords: [
    "image compression",
    "compress images online",
    "batch image compressor",
    "webp converter",
    "jpeg optimizer",
    "png compression",
    "client-side image tools",
    "private image compression",
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
  },
  twitter: {
    card: "summary_large_image",
    title: seoTitle,
    description: seoDescription,
  },
  robots: {
    index: true,
    follow: true,
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
        author: {
          "@id": `${siteOrigin}/#person`,
        },
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
