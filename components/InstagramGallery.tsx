"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { galleryImages } from "@/data/products";

export default function InstagramGallery() {
  return (
    <section className="bg-ivory">
      <div className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-28">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-muted">09 — Atelier notes</p>
            <h2 className="mt-4 font-serif text-5xl">In the frame</h2>
          </div>
          <p className="hidden text-[11px] uppercase tracking-[0.2em] text-muted md:block">
            @noura.world
          </p>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-3 lg:grid-cols-12 lg:grid-rows-2 lg:gap-4">
          {galleryImages.map((item, i) => (
            <motion.div
              key={item.src}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`relative aspect-square overflow-hidden bg-sand ${item.span ?? ""} ${
                i === 0 ? "col-span-2 lg:aspect-auto" : ""
              }`}
            >
              <Image src={item.src} alt={item.alt} fill className="object-cover" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
