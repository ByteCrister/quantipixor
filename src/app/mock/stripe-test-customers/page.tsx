import { Metadata } from "next";
import StripeTestCustomerPage from "@/components/mock/stripe-test-customers/StripeTestCustomerPage";

export const metadata: Metadata = {
  title: "Test Stripe Customer & Payment Method",
  description:
    "Create a test Stripe customer and attach a payment method securely using your own API keys. Test mode only — no real charges.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Test Stripe Customer & Payment Method | Quantipixor",
    description:
      "Create a test Stripe customer and attach a payment method securely using your own API keys. Test mode only — no real charges.",
    images: [
      {
        url: "/og-images/stripe-test-og.png", // 👈 replace with your actual image path
        width: 1200,
        height: 630,
        alt: "Stripe test customer and payment method UI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Test Stripe Customer & Payment Method | Quantipixor",
    description:
      "Create a test Stripe customer and attach a payment method securely using your own API keys.",
    images: ["/og-images/stripe-test-og.png"], // same image path
  },
};

const Page = () => {
  return <StripeTestCustomerPage />;
};

export default Page;