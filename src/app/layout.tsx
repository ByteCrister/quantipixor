import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";
import { jetbrainsMono, plusJakarta } from "@/fonts/google-fonts";



export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Quantipixor",
    template: "%s | Quantipixor",
  },
  description: "Fast, private batch image compression in your browser.",
  icons: {
    icon: "/favicon.ico", // simple default favicon
    shortcut: "/favicon-32x32.png", // optional shortcut icon
    apple: "/apple-touch-icon.png", // apple icon
  },
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