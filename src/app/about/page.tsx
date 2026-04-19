import AboutPage from '@/components/about/AboutPage'
import type { Metadata } from "next";  
  
export const metadata: Metadata = {  
  title: "About",  
  description:  
    "Learn about Quantipixor — a free, privacy-first image processing suite built by Sadiqul Islam Shakib. Discover the story, mission, and technology behind the tools.",  
  alternates: { canonical: "/about" },  
  openGraph: {  
    url: "/about",  
    title: "About | Quantipixor",  
    description:  
      "Learn about Quantipixor — a free, privacy-first image processing suite built by Sadiqul Islam Shakib.",  
  },  
};

const page = () => {
  return <AboutPage />
}

export default page