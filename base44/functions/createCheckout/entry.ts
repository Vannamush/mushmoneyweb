import { secrets } from "base44:runtime";

const PRICE_ID = "price_1U7lLQAiwDinSVSGPMPKRHSQ";
const APP_URL = "https://mush-money-track.base44.app";

export default async function(req: Request): Promise<Response> {
  try {
    const sk = secrets.get("STRIPE_SECRET_KEY");
    const params = new URLSearchParams();
    params.append("mode", "subscription");
    params.append("line_items[0][price]", PRICE_ID);
    params.append("line_items[0][quantity]", "1");
    params.append("success_url", `${APP_URL}/settings?payment=success`);
    params.append("cancel_url", `${APP_URL}/settings?payment=cancelled`);
    params.append("metadata[base44_app_id]", Deno.env.get("BASE44_APP_ID") || "");
    params.append("subscription_data[metadata][base44_app_id]", Deno.env.get("BASE44_APP_ID") || "");

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sk}`,
        "Stripe-Version": "2025-10-29.clover",
        "Content-Type": "application/x-www-form-urlencoded",
        "Idempotency-Key": crypto.randomUUID(),
      },
      body: params,
    });
    const session = await res.json();
    if (!res.ok) {
      console.error("Stripe checkout error", session.error?.message);
      return Response.json({ error: session.error?.message || "Checkout failed" }, { status: 500 });
    }
    return Response.json({ url: session.url });
  } catch (error) {
    console.error("createCheckout error", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}