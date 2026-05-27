// app/diagrams/page.tsx
import { DiagramStudio } from "@/components/diagrams/DiagramStudio";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diagram Studio | Create ERD, Sequence, Flowcharts",
  description:
    "Free online diagram editor for ERD, use case, activity, workflow, sequence and class diagrams. Edit with Mermaid or PlantUML, export to SVG, PNG, JPG, WebP.",
  keywords: [
    "diagram editor",
    "ERD",
    "sequence diagram",
    "activity diagram",
    "workflow diagram",
    "Mermaid",
    "PlantUML",
    "free diagram tool",
  ],
  openGraph: {
    title: "Quantipixor Diagram Studio",
    description:
      "Create professional diagrams in your browser. No sign-up, no uploads — entirely local.",
    images: [{ url: "/og-images/og-diagram-studio.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Quantipixor Diagram Studio",
    description:
      "Create ERD, sequence, activity, workflow, use-case & class diagrams. Edit live, export high-res.",
  },
};

export default function Page() {
  return <DiagramStudio />;
}