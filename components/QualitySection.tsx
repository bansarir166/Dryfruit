"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const stats = [
  { value: "100%", label: "Natural" },
  { value: "25+", label: "Years of craft" },
  { value: "15+", label: "Origins" },
  { value: "4.9/5", label: "Customer rating" },
];

export default function QualitySection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="bg-ivory">
      <div ref={ref} className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-28">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted">04 — Measures</p>
        <div className="mt-12 grid grid-cols-2 gap-10 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 18 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="border-t border-espresso/15 pt-6"
            >
              <p className="font-serif text-5xl md:text-6xl">{stat.value}</p>
              <p className="mt-3 text-[11px] uppercase tracking-[0.22em] text-muted">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
