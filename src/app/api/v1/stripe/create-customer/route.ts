import { NextRequest } from "next/server";
import Stripe from "stripe";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const POST = withErrorHandler(async (req: NextRequest) => {
    const body = await req.json();
    const { email, name, secretKey } = body;

    if (!secretKey || typeof secretKey !== "string" || !secretKey.startsWith("sk_")) {
        throw new ApiError("Valid Stripe secret key is required", 400);
    }

    const stripe = new Stripe(secretKey, { apiVersion: "2026-04-22.dahlia" });

    if (!email || !name) {
        throw new ApiError("Email and name are required", 400);
    }
    if (!isValidEmail(email)) {
        throw new ApiError("Invalid email format", 400);
    }

    const customer = await stripe.customers.create({ email, name });

    return {
        data: { customerId: customer.id },
    };
});