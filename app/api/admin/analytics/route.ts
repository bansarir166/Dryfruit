import { NextResponse } from "next/server";
import { getAdminProfile } from "@/lib/admin";
import { getAnalyticsData, type AnalyticsRange } from "@/lib/analytics-storage";

export async function GET(request: Request) {
  const { isAdmin } = await getAdminProfile();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const rangeParam = searchParams.get("range") as AnalyticsRange;
  const validRanges: AnalyticsRange[] = ["today", "7d", "30d", "90d", "all"];
  const range = validRanges.includes(rangeParam) ? rangeParam : "30d";

  try {
    const data = await getAnalyticsData(range);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Admin analytics fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 });
  }
}
