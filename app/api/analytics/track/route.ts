import { NextResponse } from "next/server";
import { recordAnalyticsEvent, type StoredAnalyticsEvent } from "@/lib/analytics-storage";
import type { AnalyticsPayload } from "@/lib/analytics-client";

export async function POST(request: Request) {
  try {
    let body: Partial<AnalyticsPayload>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body.visitor_id || !body.page_path) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }

    // Extract geolocation and IP from headers
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : realIp || "127.0.0.1";

    const countryHeader =
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("cf-ipcountry") ||
      request.headers.get("x-country-code");

    const cityHeader =
      request.headers.get("x-vercel-ip-city") ||
      request.headers.get("cf-ipcity") ||
      request.headers.get("x-city");

    // Default to Indian demographic if local/missing
    const country = countryHeader || "India";
    const city = cityHeader ? decodeURIComponent(cityHeader) : "Mumbai";

    const eventRecord: StoredAnalyticsEvent = {
      visitor_id: body.visitor_id,
      session_id: body.session_id || "unknown-session",
      is_returning: Boolean(body.is_returning),
      event_type: body.event_type || "page_view",
      page_path: body.page_path,
      page_title: body.page_title || "",
      referrer: body.referrer || "direct",
      traffic_source: body.traffic_source || "direct",
      traffic_medium: body.traffic_medium || "none",
      traffic_campaign: body.traffic_campaign,
      device_category: body.device_category || "desktop",
      browser: body.browser || "Unknown",
      os: body.os || "Unknown",
      screen_resolution: body.screen_resolution || "1920x1080",
      engagement_time_sec: body.engagement_time_sec || 0,
      scroll_depth_percent: body.scroll_depth_percent || 0,
      ip: clientIp,
      country,
      city,
      timestamp: body.timestamp || new Date().toISOString(),
    };

    await recordAnalyticsEvent(eventRecord);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error logging analytics event:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
