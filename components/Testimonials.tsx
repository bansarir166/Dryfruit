"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { testimonials } from "@/data/products";

export default function Testimonials() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length);
    }, 6000);
    return () => window.clearInterval(id);
  }, []);

  const item = testimonials[index];

  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-3xl px-5 py-24 text-center md:py-32">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted">08 — From the table</p>
        <div className="relative mt-10 min-h-[180px]">
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={item.quote}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5 }}
            >
              <p className="font-serif text-3xl leading-snug md:text-4xl">“{item.quote}”</p>
              <footer className="mt-8 text-[11px] uppercase tracking-[0.22em] text-muted">
                — {item.author}, {item.place}
              </footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>
        <div className="mt-10 flex justify-center gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              aria-label={`Testimonial ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 w-8 ${i === index ? "bg-espresso" : "bg-espresso/20"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
