import MockProfilePage from "@/components/mock/profile/MockProfilePage";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Random Profile Generator",
    description:
        "Generate realistic mock user profiles instantly. Perfect for design mockups, testing, and prototyping. Full names, emails, addresses, avatars, and more – all free and private.",
    keywords: [
        "mock profile generator",
        "fake user data",
        "random person generator",
        "dummy profiles",
        "test data generator",
        "avatar generator",
        "mock data for development",
    ],
    openGraph: {
        title: "Random Profile Generator – Quantipixor",
        description:
            "Create realistic test profiles with names, emails, addresses, and avatars. No sign‑up, fully private.",
        images: [{ url: "/og-images/og-profile-generator.png", width: 1200, height: 630, alt: "Quantipixor Profile Generator" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Random Profile Generator – Quantipixor",
        description:
            "Create realistic test profiles with names, emails, addresses, and avatars. No sign‑up, fully private.",
        images: ["/og-images/og-mock-profile.png"],
    },
};

export default function Page() {
    return <MockProfilePage />;
}