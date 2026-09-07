import { createClient } from "@/lib/supabase/server";
import {
  products as staticProducts,
  type Product,
  type CategorySlug,
  type Review,
  type WeightVariant,
} from "@/data/products";

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  origin: string;
  tagline: string;
  description: string;
  details: string;
  ingredients: string;
  nutrition: { label: string; value: string }[];
  storage: string;
  shipping: string;
  rating: number;
  review_count: number;
  images: string[];
  variants: WeightVariant[];
  featured: boolean;
  bestseller: boolean;
  reviews: Review[];
  active: boolean;
};

export function productToRow(product: Product, active = true): Omit<ProductRow, "active"> & { active: boolean } {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    origin: product.origin,
    tagline: product.tagline,
    description: product.description,
    details: product.details,
    ingredients: product.ingredients,
    nutrition: product.nutrition,
    storage: product.storage,
    shipping: product.shipping,
    rating: product.rating,
    review_count: product.reviewCount,
    images: product.images,
    variants: product.variants,
    featured: !!product.featured,
    bestseller: !!product.bestseller,
    reviews: product.reviews,
    active,
  };
}

export function mapProductRow(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category as CategorySlug,
    origin: row.origin,
    tagline: row.tagline,
    description: row.description,
    details: row.details,
    ingredients: row.ingredients,
    nutrition: row.nutrition || [],
    storage: row.storage,
    shipping: row.shipping,
    rating: Number(row.rating) || 0,
    reviewCount: row.review_count || 0,
    images: row.images || [],
    variants: row.variants || [],
    featured: row.featured,
    bestseller: row.bestseller,
    reviews: row.reviews || [],
  };
}

async function fetchDbProducts(opts?: { includeInactive?: boolean }) {
  try {
    const supabase = await createClient();
    let query = supabase.from("products").select("*").order("name");
    if (!opts?.includeInactive) {
      query = query.eq("active", true);
    }
    const { data, error } = await query;
    if (error || !data?.length) return null;
    return (data as ProductRow[]).map(mapProductRow);
  } catch {
    return null;
  }
}

/** Active catalog for the storefront. Falls back to static file if DB empty/unavailable. */
export async function getCatalogProducts(): Promise<Product[]> {
  const fromDb = await fetchDbProducts();
  return fromDb ?? staticProducts;
}

export async function getAllProductsAdmin(): Promise<(Product & { active: boolean })[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("products").select("*").order("name");
    if (error || !data) return [];
    return (data as ProductRow[]).map((row) => ({
      ...mapProductRow(row),
      active: row.active,
    }));
  } catch {
    return [];
  }
}

export async function getCatalogProductBySlug(slug: string): Promise<Product | undefined> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("active", true)
      .maybeSingle();
    if (!error && data) return mapProductRow(data as ProductRow);
  } catch {
    /* fall through */
  }
  return staticProducts.find((p) => p.slug === slug);
}

export async function getCatalogByCategory(category: CategorySlug): Promise<Product[]> {
  const all = await getCatalogProducts();
  return all.filter((p) => p.category === category);
}

export async function getCatalogFeatured(): Promise<Product[]> {
  const all = await getCatalogProducts();
  return all.filter((p) => p.featured).slice(0, 4);
}

export async function getCatalogBestsellers(): Promise<Product[]> {
  const all = await getCatalogProducts();
  return all.filter((p) => p.bestseller);
}

export async function catalogUsesDatabase(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true });
    return !error && (count ?? 0) > 0;
  } catch {
    return false;
  }
}
