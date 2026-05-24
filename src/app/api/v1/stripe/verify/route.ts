import { NextRequest } from "next/server";
import Stripe from "stripe";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";

export const POST = withErrorHandler(async (req: NextRequest) => {
    const { secretKey } = await req.json();
    if (!secretKey?.startsWith("sk_")) throw new ApiError("Invalid secret key", 400);
    const stripe = new Stripe(secretKey, { apiVersion: "2026-04-22.dahlia" });
    await stripe.customers.list({ limit: 1 }); // lightweight test call
    return { data: {}, success: true };
});