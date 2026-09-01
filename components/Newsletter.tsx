"use client";

import { useState } from "react";

export default function Newsletter() {
  const [done, setDone] = useState(false);

  return (
    <section className="border-t border-espresso/10 bg-ivory">
      <div className="mx-auto max-w-2xl px-5 py-20 text-center md:py-28">
        <h2 className="font-serif text-5xl md:text-6xl">Stay in the know.</h2>
        <p className="mt-4 text-muted">New collections, gifting ideas and occasional treats.</p>
        {done ? (
          <p className="mt-10 text-sm tracking-[0.12em] uppercase">You&apos;re on the list.</p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setDone(true);
            }}
            className="mt-10 flex flex-col gap-3 sm:flex-row"
          >
            <input
              required
              type="email"
              placeholder="Your email address"
              className="h-12 flex-1 border border-espresso/20 bg-transparent px-4 text-sm"
            />
            <button
              type="submit"
              className="h-12 bg-espresso px-8 text-[11px] uppercase tracking-[0.22em] text-ivory"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
