"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import type { Product } from "@/data/products";
import { formatINR } from "@/lib/utils";

export default function SearchModal() {
  const { searchOpen, setSearchOpen } = useStore();
  const [query, setQuery] = useState("");
  const [catalog, setCatalog] = useState<Product[]>([]);

  useEffect(() => {
    if (!searchOpen) {
      setQuery("");
      return;
    }

    let cancelled = false;
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((data: { products?: Product[] }) => {
        if (!cancelled) setCatalog(data.products || []);
      })
      .catch(() => {
        if (!cancelled) setCatalog([]);
      });

    return () => {
      cancelled = true;
    };
  }, [searchOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return catalog.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.includes(q) ||
        p.origin.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q)
    );
  }, [query, catalog]);

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-ivory/96 backdrop-blur-sm"
        >
          <div className="mx-auto max-w-2xl px-6 pt-24">
            <div className="flex items-center gap-4 border-b border-espresso/20 pb-4">
              <Search size={20} strokeWidth={1.3} />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search almonds, dates, gifts…"
                className="h-12 w-full bg-transparent font-serif text-3xl placeholder:text-espresso/30"
              />
              <button onClick={() => setSearchOpen(false)} aria-label="Close search">
                <X size={20} strokeWidth={1.3} />
              </button>
            </div>

            <div className="mt-8 space-y-4">
              {query && results.length === 0 && (
                <p className="text-sm text-muted">No matches. Try a variety or origin.</p>
              )}
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/shop/${product.slug}`}
                  onClick={() => setSearchOpen(false)}
                  className="flex items-center gap-4 py-2 group"
                >
                  <div className="relative h-16 w-14 overflow-hidden bg-sand">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{product.name}</p>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
                      {product.origin}
                    </p>
                  </div>
                  <p className="text-sm">{formatINR(product.variants[0].price)}</p>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
