"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { categories } from "@/data/products";

export default function Collection() {
  const [active, setActive] = useState(0);
  const current = categories[active];

  return (
    <section className="border-t border-espresso/10 bg-ivory">
      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-12">
        <div className="px-5 py-16 md:px-10 md:py-24 lg:col-span-5">
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted">01 — Selection</p>
          <h2 className="mt-4 font-serif text-5xl md:text-6xl">The Collection</h2>
          <ul className="mt-12">
            {categories.map((item, i) => (
              <li key={item.slug}>
                <Link
                  href={`/collections/${item.slug}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className="group flex items-baseline justify-between border-b border-espresso/10 py-4"
                >
                  <span className="flex items-baseline gap-5">
                    <span className="editorial-number text-[11px] text-muted">{item.number}</span>
                    <span
                      className={`font-serif text-3xl transition-colors md:text-4xl ${
                        active === i ? "text-espresso" : "text-espresso/40 group-hover:text-espresso"
                      }`}
                    >
                      {item.name}
                    </span>
                  </span>
                  <span className="hidden text-[10px] uppercase tracking-[0.2em] text-muted sm:block">
                    View
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative min-h-[420px] overflow-hidden bg-sand lg:col-span-7 lg:min-h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.slug}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <Image
                src={current.image}
                alt={current.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 58vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/50 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 text-ivory">
                <p className="font-serif text-4xl">{current.name}</p>
                <p className="mt-3 max-w-md text-sm text-ivory/80">{current.description}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
