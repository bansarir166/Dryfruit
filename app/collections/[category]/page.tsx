import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShopClient from "@/components/ShopClient";
import { categories, products, type CategorySlug } from "@/data/products";

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
