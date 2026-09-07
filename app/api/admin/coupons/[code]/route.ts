import { NextResponse } from "next/server";
import { getAdminProfile } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ code: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { isAdmin } = await getAdminProfile();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await params;
  let body: { percent?: number; active?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (typeof body.percent === "number") patch.percent = body.percent;
  if (typeof body.active === "boolean") patch.active = body.active;

  const supabase = await createClient();
  const { error } = await supabase
    .from("coupons")
    .update(patch)
    .eq("code", decodeURIComponent(code).toUpperCase());
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { isAdmin } = await getAdminProfile();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await params;
  const supabase = await createClient();
  const { error } = await supabase
    .from("coupons")
    .delete()
    .eq("code", decodeURIComponent(code).toUpperCase());
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
