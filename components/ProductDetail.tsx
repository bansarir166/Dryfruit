"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Minus, Plus, Star } from "lucide-react";
import type { Product } from "@/data/products";
import { useStore } from "@/context/StoreContext";
import { cn, formatINR } from "@/lib/utils";

const tabs = [
  { id: "details", label: "Product details" },
  { id: "ingredients", label: "Ingredients" },
  { id: "nutrition", label: "Nutritional information" },
  { id: "storage", label: "Storage" },
  { id: "shipping", label: "Shipping" },
  { id: "reviews", label: "Customer reviews" },
] as const;

export default function ProductDetail({ product }: { product: Product }) {
  const router = useRouter();
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const [activeImage, setActiveImage] = useState(0);
  const [weightIndex, setWeightIndex] = useState(Math.min(1, product.variants.length - 1));
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("details");
  const [added, setAdded] = useState(false);
  const variant = product.variants[weightIndex];
  const wished = isWishlisted(product.id);

  const add = () => {
    addToCart(product, variant, qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  const buyNow = () => {
    addToCart(product, variant, qty);
    router.push("/checkout");
  };

  return (
    <div className="bg-ivory pt-24">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-10 md:px-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <div className="relative aspect-[4/5] overflow-hidden bg-sand">
            <motion.div
              key={activeImage}
              initial={{ opacity: 0.4, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45 }}
              className="absolute inset-0"
            >
              <Image
                src={product.images[activeImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          </div>
          <div className="mt-3 flex gap-3">
            {product.images.map((src, i) => (
              <button
                key={src}
                onClick={() => setActiveImage(i)}
                className={cn(
                  "relative h-20 w-16 overflow-hidden bg-sand",
                  i === activeImage ? "ring-1 ring-espresso" : "opacity-70"
                )}
              >
                <Image src={src} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="lg:pt-6">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted">{product.origin}</p>
          <h1 className="mt-3 font-serif text-5xl md:text-6xl">{product.name}</h1>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex text-gold">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={13}
                  className={i < Math.round(product.rating) ? "fill-gold" : "opacity-30"}
                />
              ))}
            </div>
            <span className="text-sm text-muted">
              {product.rating} · {product.reviewCount} reviews
            </span>
          </div>
          <p className="mt-6 font-serif text-3xl">{formatINR(variant.price)}</p>
          <p className="mt-6 max-w-md text-base leading-relaxed text-espresso/75">
            {product.description}
          </p>

          {product.variants.length > 1 && (
            <div className="mt-8">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Weight</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.variants.map((v, i) => (
                  <button
                    key={v.label}
                    onClick={() => setWeightIndex(i)}
                    className={cn(
                      "h-10 px-4 text-[11px] uppercase tracking-[0.16em] border",
                      i === weightIndex
                        ? "border-espresso bg-espresso text-ivory"
                        : "border-espresso/15"
                    )}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Quantity</p>
            <div className="mt-3 inline-flex items-center border border-espresso/15">
              <button className="px-3 py-2" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                <Minus size={14} />
              </button>
              <span className="w-10 text-center text-sm">{qty}</span>
              <button className="px-3 py-2" onClick={() => setQty((q) => q + 1)}>
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={add}
              className="h-12 min-w-44 bg-espresso px-8 text-[11px] uppercase tracking-[0.22em] text-ivory"
            >
              {added ? "Added to bag" : "Add to bag"}
            </button>
            <button
              onClick={buyNow}
              className="h-12 min-w-36 border border-espresso px-8 text-[11px] uppercase tracking-[0.22em]"
            >
              Buy now
            </button>
            <button
              onClick={() => toggleWishlist(product.id)}
              aria-label="Wishlist"
              className="flex h-12 w-12 items-center justify-center border border-espresso/15"
            >
              <Heart size={16} className={wished ? "fill-espresso" : ""} strokeWidth={1.4} />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-5 pb-24 md:px-10">
        <div className="flex gap-6 overflow-x-auto border-b border-espresso/10 no-scrollbar">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={cn(
                "shrink-0 border-b py-4 text-[11px] uppercase tracking-[0.18em]",
                tab === item.id
                  ? "border-espresso text-espresso"
                  : "border-transparent text-muted"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="max-w-2xl py-10 text-sm leading-relaxed text-espresso/80">
          {tab === "details" && <p>{product.details}</p>}
          {tab === "ingredients" && <p>{product.ingredients}</p>}
          {tab === "nutrition" && (
            <table className="w-full text-left">
              <tbody>
                {product.nutrition.map((row) => (
                  <tr key={row.label} className="border-b border-espresso/10">
                    <th className="py-3 font-normal text-muted">{row.label}</th>
                    <td className="py-3">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tab === "storage" && <p>{product.storage}</p>}
          {tab === "shipping" && <p>{product.shipping}</p>}
          {tab === "reviews" && (
            <ul className="space-y-8">
              {product.reviews.map((review) => (
                <li key={review.id}>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
                    {review.author} · {review.date}
                    {review.verified ? " · Verified" : ""}
                  </p>
                  <p className="mt-2 font-medium">{review.title}</p>
                  <p className="mt-2">{review.body}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
