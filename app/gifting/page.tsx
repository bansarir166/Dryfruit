import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ProductGrid from "@/components/ProductGrid";
import { getProductsByCategory } from "@/data/products";

export const metadata: Metadata = { title: "Gifting" };

export default function GiftingPage() {
  const boxes = getProductsByCategory("gift-boxes");

  return (
    <div className="bg-ivory pt-24">
      <section className="relative min-h-[70vh] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=2000&q=80"
          alt="Gift boxes"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-espresso/50" />
        <div className="relative mx-auto flex min-h-[70vh] max-w-[1440px] items-end px-5 pb-16 md:px-10">
          <div className="max-w-2xl text-ivory">
            <p className="text-[11px] uppercase tracking-[0.28em] text-champagne">Gifting</p>
            <h1 className="mt-4 font-serif text-5xl md:text-7xl">
              Gift something
              <br />
              worth remembering.
            </h1>
            <p className="mt-6 max-w-md text-ivory/80">
              Curated dry-fruit collections for celebrations, clients and loved ones.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-20 md:px-10">
        <h2 className="font-serif text-4xl">House boxes</h2>
        <div className="mt-10">
          <ProductGrid products={boxes} />
        </div>
        <Link
          href="/#build"
          className="mt-12 inline-block text-[11px] uppercase tracking-[0.22em] underline underline-offset-8"
        >
          Or build your own →
        </Link>
      </section>

      <section id="corporate" className="bg-espresso text-ivory">
        <div className="mx-auto grid max-w-[1440px] lg:grid-cols-2">
          <div className="relative min-h-[380px]">
            <Image
              src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1400&q=80"
              alt="Corporate gifting"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center px-5 py-16 md:px-16">
            <h2 className="font-serif text-5xl">Corporate orders</h2>
            <p className="mt-6 max-w-md text-ivory/70">
              Sleeves, notes, and named-day delivery for teams of twelve or two hundred. Write to
              gifting@noura.world with dates and quantities.
            </p>
            <a
              href="mailto:gifting@noura.world"
              className="mt-8 inline-flex h-12 w-fit items-center bg-ivory px-7 text-[11px] uppercase tracking-[0.22em] text-espresso"
            >
              Write to the atelier
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
