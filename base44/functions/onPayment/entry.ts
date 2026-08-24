import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const eventType = body.event_type;

    const settings = await base44.asServiceRole.entities.Settings.list();
    if (settings.length === 0) {
      return Response.json({ ok: true, note: "no settings record" });
    }
    const status = eventType === "payment_succeeded" ? "active" : "cancelled";
    await base44.asServiceRole.entities.Settings.update(settings[0].id, { subscription_status: status });
    return Response.json({ ok: true, status });
  } catch (error) {
    console.error("onPayment error", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}