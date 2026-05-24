import { NextRequest } from "next/server";
import Stripe from "stripe";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const { paymentMethodId, secretKey } = await req.json();

  if (!secretKey?.startsWith("sk_")) throw new ApiError("Valid secret key required", 400);
  const stripe = new Stripe(secretKey, { apiVersion: "2026-04-22.dahlia" });

  if (!paymentMethodId?.startsWith("pm_")) throw new ApiError("Valid paymentMethodId required", 400);
  const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

  return {
    data: {
      brand: paymentMethod.card?.brand,
      last4: paymentMethod.card?.last4,
      expMonth: paymentMethod.card?.exp_month,
      expYear: paymentMethod.card?.exp_year,
    },
  };
});