import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import ProductGrid from "@/components/ProductGrid";
import { getCatalogProductBySlug, getCatalogProducts } from "@/lib/catalog";
import { products as staticProducts } from "@/data/products";

import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 60;

export async function generateStaticParams() {
  return staticProducts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };

  const title = `Buy ${product.name} — ${product.tagline || "Artisanal Dry Fruits"}`;
  const description = `${product.description} Sourced directly from ${product.origin}. Available in multiple weight options at NOURA.`;
  const canonicalUrl = `/shop/${product.slug}`;
  const images = product.images.map((img) => (img.startsWith("http") ? img : absoluteUrl(img)));

  return {
    title,
    description,
    keywords: [product.name, product.category, product.origin, "buy dry fruits online", "NOURA dry fruits"],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "article",
      images: images.map((url) => ({
        url,
        alt: product.name,
      })),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);
  if (!product) notFound();

  const all = await getCatalogProducts();
  const related = all
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Shop", url: "/shop" },
    { name: product.category, url: `/collections/${product.category}` },
    { name: product.name, url: `/shop/${product.slug}` },
  ];

  return (
    <>
      <ProductJsonLd product={product} />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <ProductDetail product={product} />
      {related.length > 0 && (
        <section className="border-t border-espresso/10 bg-ivory">
          <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-10">
            <h2 className="font-serif text-4xl">You may also like</h2>
            <div className="mt-10">
              <ProductGrid products={related} />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
