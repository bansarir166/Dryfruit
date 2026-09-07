"use client";

import { motion } from "framer-motion";
import type { Product } from "@/data/products";
import ProductCard from "./ProductCard";

export default function FeaturedProducts({ products }: { products: Product[] }) {
  const items = products.filter((p) => p.featured).slice(0, 4);

  if (!items.length) return null;

  return (
    <section className="bg-cream/60">
      <div className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col justify-between gap-4 md:flex-row md:items-end"
        >
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-muted">02 — House selection</p>
            <h2 className="mt-4 font-serif text-5xl md:text-6xl">Curated for you</h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            Four staples we keep on our own table. Chosen for origin, size, and a clean finish.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
