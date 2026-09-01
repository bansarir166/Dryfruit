"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Star } from "lucide-react";
import type { Product } from "@/data/products";
import { useStore } from "@/context/StoreContext";
import { cn, formatINR } from "@/lib/utils";

export default function ProductCard({
  product,
  variant = "default",
}: {
  product: Product;
  variant?: "default" | "edit";
}) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const [weightIndex, setWeightIndex] = useState(
    Math.min(1, product.variants.length - 1)
  );
  const [added, setAdded] = useState(false);
  const selected = product.variants[weightIndex];
  const wished = isWishlisted(product.id);

  const onAdd = () => {
    addToCart(product, selected, 1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  };

  return (
    <article className={cn("group", variant === "edit" && "min-w-[280px] md:min-w-[360px]")}>
      <div className="relative overflow-hidden bg-sand">
        <Link href={`/shop/${product.slug}`} className="block aspect-[4/5]">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 80vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
        </Link>
        <button
          aria-label="Wishlist"
          onClick={() => toggleWishlist(product.id)}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center bg-ivory/90 text-espresso"
        >
          <motion.span animate={{ scale: wished ? [1, 1.25, 1] : 1 }}>
            <Heart
              size={16}
              strokeWidth={1.4}
              className={wished ? "fill-espresso" : ""}
            />
          </motion.span>
        </button>
      </div>

      <div className="pt-5">
        <div className="flex items-center gap-1 text-gold">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={11}
              className={i < Math.round(product.rating) ? "fill-gold" : "opacity-30"}
            />
          ))}
          <span className="ml-1 text-[11px] text-muted">{product.rating.toFixed(1)}</span>
        </div>
        <Link href={`/shop/${product.slug}`} className="mt-2 block font-serif text-2xl leading-tight">
          {product.name}
        </Link>
        <p className="mt-2 text-sm text-muted">{product.tagline}</p>
        <p className="mt-3 text-sm">{formatINR(selected.price)}</p>

        {product.variants.length > 1 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {product.variants.map((v, i) => (
              <button
                key={v.label}
                onClick={() => setWeightIndex(i)}
                className={cn(
                  "h-8 px-3 text-[10px] uppercase tracking-[0.16em] border transition-colors",
                  i === weightIndex
                    ? "border-espresso bg-espresso text-ivory"
                    : "border-espresso/15 text-espresso/70 hover:border-espresso/40"
                )}
              >
                {v.label}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={onAdd}
          className="mt-5 h-11 w-full border border-espresso text-[11px] uppercase tracking-[0.22em] transition-colors hover:bg-espresso hover:text-ivory"
        >
          {added ? "Added" : "Add to bag"}
        </button>
      </div>
    </article>
  );
}
