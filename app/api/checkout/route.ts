import { NextResponse } from "next/server";
import { getSiteUrl, getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

type CheckoutItem = {
  name: string;
  weight: string;
  price: number;
  quantity: number;
  image?: string;
};

type CheckoutBody = {
  items: CheckoutItem[];
  coupon?: string | null;
};

const FALLBACK_COUPONS: Record<string, number> = {
  NOURA10: 0.1,
  GIFT20: 0.2,
};

async function resolveCouponPercent(code: string | null): Promise<number> {
  if (!code) return 0;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("coupons")
      .select("percent")
      .eq("code", code)
      .eq("active", true)
      .maybeSingle();
    if (!error && data) return Number(data.percent) || 0;
  } catch {
    /* fall through */
  }
  return FALLBACK_COUPONS[code] ?? 0;
}

export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        {
          error:
            "Stripe is not configured. Add STRIPE_SECRET_KEY to .env.local",
        },
        { status: 503 }
      );
    }

    const body = (await request.json()) as CheckoutBody;
    const items = Array.isArray(body.items) ? body.items : [];

    if (items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    for (const item of items) {
      if (
        !item.name ||
        typeof item.price !== "number" ||
        item.price <= 0 ||
        typeof item.quantity !== "number" ||
        item.quantity <= 0
      ) {
        return NextResponse.json({ error: "Invalid cart items" }, { status: 400 });
      }
    }

    const couponCode = body.coupon?.toUpperCase() || null;
    const discountPercent = await resolveCouponPercent(couponCode);

    const stripe = getStripe();
    const siteUrl = getSiteUrl();

    const line_items = items.map((item) => {
      const unitAmount = Math.round(item.price * (1 - discountPercent) * 100);
      return {
        quantity: item.quantity,
        price_data: {
          currency: "inr",
          unit_amount: Math.max(unitAmount, 100),
          product_data: {
            name: `${item.name} · ${item.weight}`,
            ...(item.image ? { images: [item.image] } : {}),
          },
        },
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout?canceled=1`,
      metadata: {
        coupon: couponCode || "",
      },
      shipping_address_collection: {
        allowed_countries: ["IN"],
      },
      phone_number_collection: {
        enabled: true,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    const message =
      error instanceof Error ? error.message : "Unable to start checkout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
