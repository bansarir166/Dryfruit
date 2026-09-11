import type { Metadata } from "next";
import ShopClient from "@/components/ShopClient";
import { getCatalogProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Shop Premium Dry Fruits, Nuts & Gift Boxes",
  description:
    "Browse NOURA's complete selection of artisanal dry fruits, raw California almonds, Konkan cashews, Antep pistachios, Kashmiri walnuts, and Medjool dates.",
  alternates: {
    canonical: "/shop",
  },
  openGraph: {
    title: "Shop Premium Dry Fruits, Nuts & Gift Boxes — NOURA",
    description:
      "Browse NOURA's complete selection of artisanal dry fruits, raw California almonds, Konkan cashews, Antep pistachios, Kashmiri walnuts, and Medjool dates.",
    url: "/shop",
  },
};

export const revalidate = 60;

export default async function ShopPage() {
  const products = await getCatalogProducts();
  return <ShopClient products={products} />;
}
