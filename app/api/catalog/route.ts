import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mapProductRow, type ProductRow } from "@/lib/catalog";
import { products as staticProducts, searchProducts } from "@/data/products";

/** Lightweight public catalog for search / wishlist. */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() || "";

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("products").select("*").eq("active", true);
    if (!error && data?.length) {
      let list = (data as ProductRow[]).map(mapProductRow);
      if (q) {
        const needle = q.toLowerCase();
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(needle) ||
            p.category.includes(needle) ||
            p.origin.toLowerCase().includes(needle) ||
            p.tagline.toLowerCase().includes(needle)
        );
      }
      return NextResponse.json({ products: list, source: "db" });
    }
  } catch {
    /* fall through */
  }

  const products = q ? searchProducts(q) : staticProducts;
  return NextResponse.json({ products, source: "static" });
}
