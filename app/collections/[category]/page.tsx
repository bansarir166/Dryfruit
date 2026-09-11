import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShopClient from "@/components/ShopClient";
import { categories, type CategorySlug } from "@/data/products";
import { getCatalogProducts } from "@/lib/catalog";

import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl } from "@/lib/seo";

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
  if (!item) return { title: "Collection Not Found" };

  const title = `Buy Premium ${item.name} — Artisanal Sourcing`;
  const description = `${item.description} Sourced thoughtfully by NOURA. Shop luxury ${item.name.toLowerCase()} online.`;
  const canonicalUrl = `/collections/${item.slug}`;

  return {
    title,
    description,
    keywords: [item.name, item.slug, "buy dry fruits online", "NOURA"],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} — NOURA`,
      description,
      url: canonicalUrl,
      images: [
        {
          url: item.image.startsWith("http") ? item.image : absoluteUrl(item.image),
          alt: item.name,
        },
      ],
    },
  };
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

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Collections", url: "/collections" },
    { name: item.name, url: `/collections/${item.slug}` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <ShopClient
        products={products}
        initialCategory={item.slug as CategorySlug}
        heading={item.name}
        kicker={`${item.number} — Collection`}
        intro={item.description}
      />
    </>
  );
}
