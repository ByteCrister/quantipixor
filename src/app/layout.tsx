import type { Metadata } from "next";
import "./globals.css";
import { env } from "@huggingface/transformers";

env.useBrowserCache = true;
env.allowLocalModels = false;

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";
import { jetbrainsMono, plusJakarta } from "@/fonts/google-fonts";



export const metadata: Metadata = {  
  metadataBase: new URL(  
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",  
  ),  
  
  title: {  
    default: "Quantipixor — Free Online Batch Image Compressor",  
    template: "%s | Quantipixor",  
  },  
  
  description:  
    "Quantipixor is a free, privacy-first batch image compressor that runs entirely in your browser. Optimize JPG, PNG, WebP & AVIF files instantly — no uploads required.",  
  
  applicationName: "Quantipixor",  
  
  keywords: [  
    "image compressor",  
    "batch image compression",  
    "compress images online free",  
    "browser image optimizer",  
    "private image compression",  
    "Quantipixor",  
  ],  
  
  authors: [  
    {  
      name: "Sadiqul Islam Shakib",  
      url: "https://www.linkedin.com/in/sadiqul-islam-shakib",  
    },  
  ],  
  creator: "Sadiqul Islam Shakib",  
  publisher: "Sadiqul Islam Shakib",  
  
  openGraph: {  
    type: "website",  
    locale: "en_US",  
    siteName: "Quantipixor",  
    title: "Quantipixor — Free Online Batch Image Compressor",  
    description:  
      "Compress hundreds of images at once, right in your browser. No uploads, no sign-ups — 100 % private.",  
    images: [{ url: "/og-images/og-landing-page.png", width: 1200, height: 630, alt: "Quantipixor — batch image compression" }],  
  },  
  
  twitter: {  
    card: "summary_large_image",  
    title: "Quantipixor — Free Online Batch Image Compressor",  
    description:  
      "Compress hundreds of images at once, right in your browser. No uploads, no sign-ups — 100 % private.",  
    images: ["/og-images/og-landing-page.png"],  
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
  
  icons: {  
    icon: "/favicon.ico",  
    apple: "/apple-touch-icon.png",  
  },  
  
  // verification: {  
  //   google: "GOOGLE_SITE_VERIFICATION_CODE",  
  // },  
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans text-foreground">
        <Header />
        {children}
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}