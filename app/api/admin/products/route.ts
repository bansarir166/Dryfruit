import { NextResponse } from "next/server";
import { getAdminProfile } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { productToRow } from "@/lib/catalog";
import { products as staticProducts } from "@/data/products";
import { slugify } from "@/lib/utils";

export async function GET() {
  const { isAdmin } = await getAdminProfile();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select("*").order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data });
}

export async function POST(request: Request) {
  const { isAdmin } = await getAdminProfile();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = String(body.name || "").trim();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const id = String(body.id || `p-${slugify(name)}-${Date.now().toString(36)}`);
  const slug = String(body.slug || slugify(name));

  const row = {
    id,
    slug,
    name,
    category: String(body.category || "almonds"),
    origin: String(body.origin || ""),
    tagline: String(body.tagline || ""),
    description: String(body.description || ""),
    details: String(body.details || ""),
    ingredients: String(body.ingredients || ""),
    nutrition: body.nutrition ?? [],
    storage: String(body.storage || ""),
    shipping: String(body.shipping || ""),
    rating: Number(body.rating) || 0,
    review_count: Number(body.review_count ?? body.reviewCount) || 0,
    images: Array.isArray(body.images) ? body.images : [],
    variants: Array.isArray(body.variants) ? body.variants : [{ label: "250g", grams: 250, price: 499 }],
    featured: Boolean(body.featured),
    bestseller: Boolean(body.bestseller),
    reviews: Array.isArray(body.reviews) ? body.reviews : [],
    active: body.active !== false,
    updated_at: new Date().toISOString(),
  };

  const supabase = await createClient();
  const { error } = await supabase.from("products").insert(row);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id });
}

/** Import static catalog into DB (upsert). */
export async function PUT() {
  const { isAdmin } = await getAdminProfile();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = staticProducts.map((p) => ({
    ...productToRow(p, true),
    updated_at: new Date().toISOString(),
  }));

  const supabase = await createClient();
  const { error } = await supabase.from("products").upsert(rows, { onConflict: "id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, count: rows.length });
}
