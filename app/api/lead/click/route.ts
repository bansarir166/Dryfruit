import { NextRequest, NextResponse } from "next/server";
import { recordLeadClick } from "@/lib/lead-tracker";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const id = searchParams.get("id") || undefined;
  const email = searchParams.get("email") || "";
  const biz = searchParams.get("biz") || searchParams.get("business") || undefined;
  const name = searchParams.get("name") || searchParams.get("owner") || undefined;
  const city = searchParams.get("city") || undefined;
  const country = searchParams.get("country") || undefined;
  const dest = searchParams.get("dest") || "/";

  // IP & User Agent detection
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : realIp || "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || undefined;

  // Build target redirect URL
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")
      ? process.env.NEXT_PUBLIC_SITE_URL
      : request.nextUrl.origin;

  let redirectTarget: URL;
  try {
    redirectTarget = dest.startsWith("http") ? new URL(dest) : new URL(dest, origin);
  } catch {
    redirectTarget = new URL("/", origin);
  }

  // Preserve UTM and attribution tags
  redirectTarget.searchParams.set("utm_source", "email_outreach");
  if (id) redirectTarget.searchParams.set("lead_id", id);
  if (biz) redirectTarget.searchParams.set("lead_biz", biz);

  // If email is provided, record the click in background or synchronously
  if (email) {
    try {
      await recordLeadClick({
        id,
        email,
        business_name: biz,
        owner: name,
        city,
        country,
        ip: clientIp,
        userAgent,
      });
    } catch (err) {
      console.error("Error in lead click tracking:", err);
    }
  }

  return NextResponse.redirect(redirectTarget.toString(), { status: 307 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.email) {
      return NextResponse.json({ ok: false, error: "Missing email" }, { status: 400 });
    }

    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : realIp || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || undefined;

    const lead = await recordLeadClick({
      id: body.id,
      email: body.email,
      business_name: body.business_name || body.biz,
      owner: body.owner || body.name,
      city: body.city,
      country: body.country,
      ip: clientIp,
      userAgent,
    });

    return NextResponse.json({ ok: true, lead });
  } catch (err) {
    console.error("Error handling POST lead click:", err);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}
