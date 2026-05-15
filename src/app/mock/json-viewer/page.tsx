import JsonViewerPage from "@/components/mock/json-viewer/JsonViewerPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "JSON Viewer",
    description:
        "View, explore, and validate JSON data in a clean card-based interface. Paste raw JSON or upload a .json file to visualize nested structures, copy formatted output, and inspect arrays or objects.",
    openGraph: {
        title: "JSON Viewer — Free Online JSON Explorer",
        description:
            "Paste or upload JSON and see it transformed into an interactive, readable card layout. Perfect for debugging APIs or inspecting data dumps.",
        images: [
            {
                url: "/og-images/og-mock-json-viewer.png", // optional – create if you want a dedicated preview
                width: 1200,
                height: 630,
                alt: "JSON Viewer – browse JSON as expandable cards",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "JSON Viewer — Free Online JSON Explorer",
        description:
            "Paste or upload JSON and see it transformed into an interactive, readable card layout. Perfect for debugging APIs or inspecting data dumps.",
        images: ["/og-images/og-mock-json-viewer.png"],
    },
    keywords: [
        "JSON viewer",
        "JSON editor online",
        "parse JSON",
        "JSON formatter",
        "inspect JSON data",
        "JSON visualizer",
    ],
};

const Page = () => {
    return <JsonViewerPage />;
};

export default Page;