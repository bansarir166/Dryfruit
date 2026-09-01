"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function GiftSection() {
  return (
    <section className="bg-espresso text-ivory">
      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-2">
        <div className="relative min-h-[420px] lg:min-h-[640px]">
          <Image
            src="https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=1600&q=80"
            alt="Luxury gift box"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col justify-center px-5 py-20 md:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-[11px] uppercase tracking-[0.28em] text-champagne">06 — Gifting</p>
            <h2 className="mt-5 font-serif text-5xl leading-[0.95] md:text-6xl">
              Gift something
              <br />
              worth remembering.
            </h2>
            <p className="mt-8 max-w-md text-base leading-relaxed text-ivory/70">
              Curated dry-fruit collections for celebrations, clients and loved ones.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/gifting"
                className="flex h-12 items-center bg-ivory px-7 text-[11px] uppercase tracking-[0.22em] text-espresso"
              >
                Explore gifting
              </Link>
              <Link
                href="/gifting#corporate"
                className="flex h-12 items-center border border-ivory/30 px-7 text-[11px] uppercase tracking-[0.22em] text-ivory"
              >
                Corporate orders
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
