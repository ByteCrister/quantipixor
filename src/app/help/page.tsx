import HelpPage from "@/components/help/HelpPage"
import type { Metadata } from "next";  
  
export const metadata: Metadata = {  
  title: "Help",  
  description:  
    "Get help using Quantipixor's image tools — batch compression, conversion, background removal, OCR formatting, and favicon generation. Find answers to common questions.",  
  alternates: { canonical: "/help" },  
  openGraph: {  
    url: "/help",  
    title: "Help | Quantipixor",  
    description:  
      "Find answers and guides for all Quantipixor image tools.",  
  },  
};

const page = () => {
    return <HelpPage />
}

export default page