"use client";

import Image from "next/image";
import Link from "next/link";
import { products } from "@/data/products";
import { useStore } from "@/context/StoreContext";
import { formatINR } from "@/lib/utils";

export default function AccountPage() {
  const { wishlist, toggleWishlist } = useStore();
  const saved = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="bg-ivory pt-24">
      <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-10">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Your house</p>
        <h1 className="mt-3 font-serif text-5xl md:text-6xl">Account</h1>
        <p className="mt-4 max-w-md text-sm text-muted">
          Sign-in will connect to a full account later. For now, your wishlist lives here.
        </p>

        <h2 className="mt-16 font-serif text-3xl">Wishlist</h2>
        {saved.length === 0 ? (
          <p className="mt-6 text-sm text-muted">
            Nothing saved yet. Tap the heart on a product to keep it.
          </p>
        ) : (
          <ul className="mt-8 divide-y divide-espresso/10">
            {saved.map((product) => (
              <li key={product.id} className="flex items-center gap-4 py-5">
                <Link href={`/shop/${product.slug}`} className="relative h-20 w-16 overflow-hidden bg-sand">
                  <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                </Link>
                <div className="flex-1">
                  <Link href={`/shop/${product.slug}`} className="text-sm">
                    {product.name}
                  </Link>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-muted">
                    {formatINR(product.variants[0].price)}
                  </p>
                </div>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="text-[10px] uppercase tracking-[0.18em] text-muted"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
