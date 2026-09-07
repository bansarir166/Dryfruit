import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapProductRow, type ProductRow } from "@/lib/catalog";
import ProductForm from "@/components/admin/ProductForm";
import { type ProductFormValues } from "@/lib/product-form";

type Props = { params: Promise<{ id: string }> };

export default async function AdminEditProductPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (error || !data) notFound();

  const row = data as ProductRow;
  const product = mapProductRow(row);

  const initial: ProductFormValues = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    origin: product.origin,
    tagline: product.tagline,
    description: product.description,
    details: product.details,
    ingredients: product.ingredients,
    storage: product.storage,
    shipping: product.shipping,
    images: product.images.join("\n"),
    variantsJson: JSON.stringify(product.variants, null, 2),
    featured: !!product.featured,
    bestseller: !!product.bestseller,
    active: row.active,
    rating: product.rating,
    review_count: product.reviewCount,
  };

  return (
    <div>
      <Link
        href="/admin/products"
        className="text-[11px] uppercase tracking-[0.2em] text-muted underline underline-offset-4"
      >
        Products
      </Link>
      <h1 className="mt-4 font-serif text-4xl">{product.name}</h1>
      <p className="mt-2 text-sm text-muted">
        <Link href={`/shop/${product.slug}`} className="underline underline-offset-4" target="_blank">
          View on storefront
        </Link>
      </p>
      <div className="mt-10">
        <ProductForm mode="edit" initial={initial} />
      </div>
    </div>
  );
}
