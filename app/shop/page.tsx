import type { Metadata } from "next";
import ShopClient from "@/components/ShopClient";
import { getCatalogProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Shop",
};

export const revalidate = 60;

export default async function ShopPage() {
  const products = await getCatalogProducts();
  return <ShopClient products={products} />;
}
