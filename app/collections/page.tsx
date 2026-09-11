import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { categories } from "@/data/products";

export const metadata: Metadata = {
  title: "Dry Fruit Collections — Almonds, Cashews, Pistachios & Dates",
  description:
    "Explore NOURA's curated collections by variety: California almonds, Konkan cashews, Antep pistachios, Kashmiri walnuts, Medjool dates, and luxury gift boxes.",
  alternates: {
    canonical: "/collections",
  },
  openGraph: {
    title: "Dry Fruit Collections — NOURA",
    description:
      "Explore NOURA's curated collections by variety: California almonds, Konkan cashews, Antep pistachios, Kashmiri walnuts, Medjool dates, and luxury gift boxes.",
    url: "/collections",
  },
};

export default function CollectionsPage() {
  return (
    <div className="bg-ivory pt-24">
      <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-10">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted">By variety</p>
        <h1 className="mt-3 font-serif text-5xl md:text-7xl">Collections</h1>
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {categories.map((item) => (
            <Link key={item.slug} href={`/collections/${item.slug}`} className="group relative min-h-[320px] overflow-hidden bg-sand">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-espresso/35" />
              <div className="absolute bottom-8 left-8 text-ivory">
                <p className="text-[11px] tracking-[0.22em]">{item.number}</p>
                <p className="mt-2 font-serif text-5xl">{item.name}</p>
                <p className="mt-3 max-w-sm text-sm text-ivory/80">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
