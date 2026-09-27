import { NextRequest, NextResponse } from "next/server";
import { recordLeadClick } from "@/lib/lead-tracker";

/**
 * Brevo Webhook Endpoint
 * Handles Brevo transactional email event webhooks: 'click', 'opened', etc.
 * Docs: https://developers.brevo.com/docs/transactional-webhooks
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // Brevo webhook payload structure:
    // { event: 'click', email: 'recipient@domain.com', link: 'https://...', date: '...' }
    const event = payload.event;
    const email = payload.email;

    if (event === "click" && email) {
      const forwardedFor = request.headers.get("x-forwarded-for");
      const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : payload.ip || "127.0.0.1";

      await recordLeadClick({
        email,
        business_name: payload.tag || payload["message-id"] ? `Prospect (${email})` : undefined,
        ip: clientIp,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error handling Brevo webhook event:", error);
    return NextResponse.json({ ok: false, error: "Webhook processing error" }, { status: 500 });
  }
}
