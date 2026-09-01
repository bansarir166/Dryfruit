"use client";

import { useRef, type MouseEvent } from "react";
import { getBestsellers } from "@/data/products";
import ProductCard from "./ProductCard";

export default function NouraEdit() {
  const scroller = useRef<HTMLDivElement>(null);
  const items = getBestsellers();
  const drag = useRef({ down: false, startX: 0, scroll: 0 });

  const onDown = (e: MouseEvent) => {
    const el = scroller.current;
    if (!el) return;
    drag.current = { down: true, startX: e.pageX - el.offsetLeft, scroll: el.scrollLeft };
  };
  const onLeave = () => {
    drag.current.down = false;
  };
  const onMove = (e: MouseEvent) => {
    if (!drag.current.down || !scroller.current) return;
    e.preventDefault();
    const x = e.pageX - scroller.current.offsetLeft;
    scroller.current.scrollLeft = drag.current.scroll - (x - drag.current.startX);
  };

  return (
    <section className="bg-ivory">
      <div className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-28">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted">07 — Bestsellers</p>
        <h2 className="mt-4 font-serif text-5xl md:text-6xl">The NOURA Edit</h2>
        <div
          ref={scroller}
          onMouseDown={onDown}
          onMouseLeave={onLeave}
          onMouseUp={onLeave}
          onMouseMove={onMove}
          className="no-scrollbar mt-12 flex cursor-grab gap-8 overflow-x-auto pb-4 active:cursor-grabbing"
        >
          {items.map((product) => (
            <ProductCard key={product.id} product={product} variant="edit" />
          ))}
        </div>
      </div>
    </section>
  );
}
