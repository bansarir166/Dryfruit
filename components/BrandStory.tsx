"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function BrandStory() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-espresso text-ivory">
      <div className="absolute inset-0">
        <motion.div style={{ y }} className="absolute -inset-y-16 inset-x-0">
          <Image
            src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=2000&q=80"
            alt="A composed table"
            fill
            className="object-cover opacity-50"
          />
        </motion.div>
        <div className="absolute inset-0 bg-espresso/55" />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-5 py-28 md:px-10 md:py-40">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl"
        >
          <p className="text-[11px] uppercase tracking-[0.28em] text-champagne">03 — The house</p>
          <h2 className="mt-5 font-serif text-5xl leading-[0.95] md:text-7xl">
            From the earth.
            <br />
            To your table.
          </h2>
          <p className="mt-8 max-w-lg text-base leading-relaxed text-ivory/75 md:text-lg">
            Every NOURA selection begins with careful sourcing and ends with thoughtful
            presentation. We choose exceptional ingredients, preserve their natural character, and
            deliver them to your table at their finest.
          </p>
          <Link
            href="/story"
            className="mt-10 inline-block text-[11px] uppercase tracking-[0.24em] text-ivory underline underline-offset-8 decoration-ivory/40"
          >
            Our story →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
