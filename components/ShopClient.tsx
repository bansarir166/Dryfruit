"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { CategorySlug, Product } from "@/data/products";
import { categories, sortProducts } from "@/data/products";
import ProductGrid from "./ProductGrid";
import { cn } from "@/lib/utils";

type Sort = "featured" | "price-asc" | "price-desc" | "name";

export default function ShopClient({
  products,
  initialCategory,
  heading = "Shop",
  kicker = "The pantry",
  intro = "Every nut, fruit, and seed we keep — filtered by origin, not by noise.",
}: {
  products: Product[];
  initialCategory?: CategorySlug;
  heading?: string;
  kicker?: string;
  intro?: string;
}) {
  const [category, setCategory] = useState<CategorySlug | "all">(initialCategory ?? "all");
  const [sort, setSort] = useState<Sort>("featured");

  const filtered = useMemo(() => {
    const list = category === "all" ? products : products.filter((p) => p.category === category);
    return sortProducts(list, sort);
  }, [products, category, sort]);

  return (
    <div className="bg-ivory pt-24">
      <div className="mx-auto max-w-[1440px] px-5 py-12 md:px-10 md:py-16">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted">{kicker}</p>
        <h1 className="mt-3 font-serif text-5xl md:text-7xl">{heading}</h1>
        <p className="mt-4 max-w-md text-muted">{intro}</p>

        <div className="mt-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <FilterChip active={category === "all"} onClick={() => setCategory("all")}>
              All
            </FilterChip>
            {categories.map((c) => (
              <FilterChip
                key={c.slug}
                active={category === c.slug}
                onClick={() => setCategory(c.slug)}
              >
                {c.name}
              </FilterChip>
            ))}
          </div>
          <label className="flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-muted">
            Sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="h-10 border border-espresso/15 bg-transparent px-3 text-espresso"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price, low to high</option>
              <option value="price-desc">Price, high to low</option>
              <option value="name">Name</option>
            </select>
          </label>
        </div>

        <p className="mt-8 text-[11px] uppercase tracking-[0.18em] text-muted">
          {filtered.length} pieces
        </p>
        <div className="mt-10">
          <ProductGrid products={filtered} />
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-9 shrink-0 px-4 text-[11px] uppercase tracking-[0.16em] border",
        active ? "border-espresso bg-espresso text-ivory" : "border-espresso/15"
      )}
    >
      {children}
    </button>
  );
}
