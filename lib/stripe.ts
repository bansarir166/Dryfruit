import Stripe from "stripe";

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Missing STRIPE_SECRET_KEY. Add it to .env.local");
  }
  return new Stripe(key, {
    apiVersion: "2026-08-26.dahlia",
  });
}

export function getSiteUrl(request?: Request) {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  // Prefer the live request host so deployed checkouts never fall back to localhost
  if (request) {
    const origin = request.headers.get("origin");
    if (origin) return origin.replace(/\/$/, "");

    const host =
      request.headers.get("x-forwarded-host") || request.headers.get("host");
    if (host) {
      const proto =
        request.headers.get("x-forwarded-proto") ||
        (host.includes("localhost") ? "http" : "https");
      return `${proto}://${host}`.replace(/\/$/, "");
    }
  }

  const vercel = process.env.VERCEL_URL?.replace(/\/$/, "");
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}
