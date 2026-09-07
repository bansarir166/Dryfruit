import { NextResponse } from "next/server";
import { getAdminProfile } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const { isAdmin } = await getAdminProfile();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createClient();
  const { data, error } = await supabase.from("coupons").select("*").order("code");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ coupons: data });
}

export async function POST(request: Request) {
  const { isAdmin } = await getAdminProfile();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { code?: string; percent?: number; active?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const code = String(body.code || "")
    .trim()
    .toUpperCase();
  const percent = Number(body.percent);
  if (!code || !(percent > 0 && percent <= 1)) {
    return NextResponse.json({ error: "Need code and percent (0–1, e.g. 0.1)" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("coupons").upsert({
    code,
    percent,
    active: body.active !== false,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
