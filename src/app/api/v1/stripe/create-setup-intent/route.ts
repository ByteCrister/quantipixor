import { NextRequest } from "next/server";
import Stripe from "stripe";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";

export const POST = withErrorHandler(async (req: NextRequest) => {
    const { customerId, secretKey } = await req.json();

    if (!secretKey?.startsWith("sk_")) throw new ApiError("Valid secret key required", 400);
    const stripe = new Stripe(secretKey, { apiVersion: "2026-04-22.dahlia" });

    if (!customerId?.startsWith("cus_")) throw new ApiError("Valid customerId required", 400);
    const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ["card"],
    });

    return { data: { clientSecret: setupIntent.client_secret } };
});