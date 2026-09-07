import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Public coupon lookup for cart + checkout. */
export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code")?.trim().toUpperCase();
  if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });

  const fallback: Record<string, number> = { NOURA10: 0.1, GIFT20: 0.2 };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("coupons")
      .select("code, percent, active")
      .eq("code", code)
      .eq("active", true)
      .maybeSingle();

    if (!error && data) {
      return NextResponse.json({ code: data.code, percent: Number(data.percent) });
    }
  } catch {
    /* fall through */
  }

  if (fallback[code]) {
    return NextResponse.json({ code, percent: fallback[code] });
  }

  return NextResponse.json({ error: "Invalid coupon" }, { status: 404 });
}
