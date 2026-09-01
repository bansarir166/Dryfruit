import type { Metadata } from "next";
import ShopClient from "@/components/ShopClient";
import { products } from "@/data/products";

export const metadata: Metadata = {
  title: "Shop",
};

export default function ShopPage() {
  return <ShopClient products={products} />;
}
