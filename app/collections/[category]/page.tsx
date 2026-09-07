import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShopClient from "@/components/ShopClient";
import { categories, type CategorySlug } from "@/data/products";
import { getCatalogProducts } from "@/lib/catalog";

export const revalidate = 60;

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const item = categories.find((c) => c.slug === category);
  return { title: item?.name ?? "Collection" };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const item = categories.find((c) => c.slug === category);
  if (!item) notFound();

  const products = await getCatalogProducts();

  return (
    <ShopClient
      products={products}
      initialCategory={item.slug as CategorySlug}
      heading={item.name}
      kicker={`${item.number} — Collection`}
      intro={item.description}
    />
  );
}
