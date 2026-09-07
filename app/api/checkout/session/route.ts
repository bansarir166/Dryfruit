import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items.data.price.product"],
    });

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    const items =
      session.line_items?.data.map((item) => ({
        name: item.description || "Item",
        quantity: item.quantity ?? 1,
        price: (item.amount_total ?? 0) / 100,
      })) ?? [];

    return NextResponse.json({
      email: session.customer_details?.email ?? session.customer_email,
      amount_total: session.amount_total ?? 0,
      currency: session.currency ?? "inr",
      items,
      shipping: session.customer_details?.address ?? null,
    });
  } catch (error) {
    console.error("Stripe session fetch error:", error);
    const message = error instanceof Error ? error.message : "Unable to load session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
