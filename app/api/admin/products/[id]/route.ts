import { NextResponse } from "next/server";
import { getAdminProfile } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { isAdmin } = await getAdminProfile();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const allowed = [
    "slug",
    "name",
    "category",
    "origin",
    "tagline",
    "description",
    "details",
    "ingredients",
    "nutrition",
    "storage",
    "shipping",
    "rating",
    "review_count",
    "images",
    "variants",
    "featured",
    "bestseller",
    "reviews",
    "active",
  ] as const;

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (key in body) patch[key] = body[key];
  }
  if ("reviewCount" in body) patch.review_count = body.reviewCount;

  const supabase = await createClient();
  const { error } = await supabase.from("products").update(patch).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { isAdmin } = await getAdminProfile();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
