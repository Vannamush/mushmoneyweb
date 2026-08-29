import { secrets } from "base44:runtime";

// Legacy shortcut: fixed Pro subscription prices (still used by ProPlans)
const PRICES: Record<string, string> = {
  monthly: "price_1U7lLQAiwDinSVSGPMPKRHSQ",
  yearly: "price_1U7lPFAiwDinSVSGxu6j2dYo",
};
const APP_URL = "https://mush-money-track.base44.app";

// --- Guards against unauthorized use ---
// 1) Origin: only allow requests originating from this app (published or preview).
const APP_HOST = "mush-money-track.base44.app";
function authorizedOrigin(req: Request): boolean {
  const origin = req.headers.get("origin") || "";
  const referer = req.headers.get("referer") || "";
  if (!origin && !referer) return true; // platform-internal call with no browser headers
  return origin.includes(APP_HOST) || referer.includes(APP_HOST);
}
// 2) Rate limit: cap checkout starts per client to prevent spam/abuse.
const RATE = { max: 10, windowMs: 60_000 };
const hits = new Map<string, number[]>();
function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for") || "";
  return fwd.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}
function rateLimited(key: string): boolean {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < RATE.windowMs);
  if (arr.length >= RATE.max) return true;
  arr.push(now);
  hits.set(key, arr);
  return false;
}

export default async function(req: Request): Promise<Response> {
  try {
    if (!authorizedOrigin(req)) {
      return Response.json({ error: "Unauthorized: requests must come from this app." }, { status: 403 });
    }
    if (rateLimited(clientKey(req))) {
      return Response.json({ error: "Too many checkout attempts. Please slow down and try again shortly." }, { status: 429 });
    }
    const body = await req.json().catch(() => ({}));
    const sk = secrets.get("STRIPE_SECRET_KEY");
    const appId = Deno.env.get("BASE44_APP_ID") || "";

    const params = new URLSearchParams();
    params.append("metadata[base44_app_id]", appId);

    // Legacy fixed-plan subscription (ProPlans passes { plan })
    if (body.plan && PRICES[body.plan]) {
      const plan = body.plan as string;
      params.append("mode", "subscription");
      params.append("line_items[0][price]", PRICES[plan]);
      params.append("line_items[0][quantity]", "1");
      params.append("success_url", `${APP_URL}/settings?payment=success`);
      params.append("cancel_url", `${APP_URL}/settings?payment=cancelled`);
      params.append("subscription_data[metadata][base44_app_id]", appId);
    } else {
      // General-purpose payment: any amount, any name, one-time or recurring.
      const amount = Number(body.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        return Response.json({ error: "A positive amount is required." }, { status: 400 });
      }
      const currency = (body.currency || "usd").toString().toLowerCase();
      const name = (body.name || "Payment").toString().slice(0, 200);
      const mode = body.mode === "subscription" ? "subscription" : "payment";
      const successUrl = (body.success_url as string) || `${APP_URL}/?payment=success`;
      const cancelUrl = (body.cancel_url as string) || `${APP_URL}/?payment=cancelled`;

      params.append("mode", mode);
      params.append("line_items[0][quantity]", "1");
      params.append("success_url", successUrl);
      params.append("cancel_url", cancelUrl);

      if (mode === "subscription") {
        // Recurring: create an inline price on the fly so any amount can recur.
        params.append("line_items[0][price_data][currency]", currency);
        params.append("line_items[0][price_data][unit_amount]", String(Math.round(amount * 100)));
        params.append("line_items[0][price_data][recurring][interval]", (body.interval || "month").toString());
        params.append("line_items[0][price_data][product_data][name]", name);
        params.append("subscription_data[metadata][base44_app_id]", appId);
      } else {
        // One-time: ad-hoc line item, any amount.
        params.append("line_items[0][price_data][currency]", currency);
        params.append("line_items[0][price_data][unit_amount]", String(Math.round(amount * 100)));
        params.append("line_items[0][price_data][product_data][name]", name);
      }
    }

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