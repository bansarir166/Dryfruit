"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { boxBuilderOptions } from "@/data/products";
import { useStore } from "@/context/StoreContext";
import { cn, formatINR } from "@/lib/utils";

const steps = [
  "Choose your box",
  "Choose dry fruits",
  "Choose quantity",
  "Personal message",
  "Preview",
];

export default function BuildYourBox() {
  const { addCustomItem } = useStore();
  const [step, setStep] = useState(0);
  const [boxId, setBoxId] = useState(boxBuilderOptions.boxes[1].id);
  const [selected, setSelected] = useState<string[]>(["almonds", "pistachios"]);
  const [qty, setQty] = useState(150);
  const [message, setMessage] = useState("");
  const [created, setCreated] = useState(false);

  const box = boxBuilderOptions.boxes.find((b) => b.id === boxId)!;
  const fruits = boxBuilderOptions.fruits.filter((f) => selected.includes(f.id));

  const total = useMemo(() => {
    const fill = fruits.reduce((sum, f) => sum + f.pricePer100g * (qty / 100), 0);
    return box.basePrice + fill;
  }, [box.basePrice, fruits, qty]);

  const canNext =
    (step === 0 && boxId) ||
    (step === 1 && selected.length > 0 && selected.length <= box.slots) ||
    step === 2 ||
    step === 3 ||
    step === 4;

  const toggleFruit = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= box.slots) return prev;
      return [...prev, id];
    });
  };

  const create = () => {
    addCustomItem({
      productId: `box-${box.id}`,
      slug: "signature-gift-box",
      name: `${box.name} Box — ${fruits.map((f) => f.name).join(", ")}`,
      image: box.image,
      weight: `${fruits.length} × ${qty}g`,
      price: total,
      quantity: 1,
    });
    setCreated(true);
  };

  return (
    <section id="build" className="bg-cream">
      <div className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-28">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted">05 — Atelier</p>
        <h2 className="mt-4 font-serif text-5xl md:text-6xl">Build your box</h2>
        <p className="mt-4 text-muted">Create a gift that&apos;s uniquely yours.</p>

        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ol className="mb-10 flex flex-wrap gap-4 text-[10px] uppercase tracking-[0.18em] text-muted">
              {steps.map((label, i) => (
                <li
                  key={label}
                  className={cn(i === step && "text-espresso", i < step && "text-pistachio")}
                >
                  0{i + 1} {label}
                </li>
              ))}
            </ol>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
              >
                {step === 0 && (
                  <div className="grid gap-4 sm:grid-cols-3">
                    {boxBuilderOptions.boxes.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setBoxId(item.id)}
                        className={cn(
                          "overflow-hidden border text-left transition-colors",
                          boxId === item.id ? "border-espresso" : "border-espresso/10"
                        )}
                      >
                        <div className="relative aspect-[4/3]">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="p-4">
                          <p className="font-serif text-2xl">{item.name}</p>
                          <p className="mt-1 text-xs text-muted">{item.description}</p>
                          <p className="mt-3 text-sm">{formatINR(item.basePrice)} base</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {step === 1 && (
                  <div>
                    <p className="mb-4 text-sm text-muted">
                      Select up to {box.slots} varieties. {selected.length} chosen.
                    </p>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      {boxBuilderOptions.fruits.map((fruit) => {
                        const on = selected.includes(fruit.id);
                        return (
                          <button
                            key={fruit.id}
                            onClick={() => toggleFruit(fruit.id)}
                            className={cn(
                              "overflow-hidden border text-left",
                              on ? "border-espresso" : "border-espresso/10"
                            )}
                          >
                            <div className="relative aspect-square">
                              <Image src={fruit.image} alt={fruit.name} fill className="object-cover" />
                            </div>
                            <div className="p-3">
                              <p className="text-sm">{fruit.name}</p>
                              <p className="text-[11px] text-muted">
                                {formatINR(fruit.pricePer100g)} / 100g
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="flex flex-wrap gap-3">
                    {boxBuilderOptions.quantities.map((q) => (
                      <button
                        key={q}
                        onClick={() => setQty(q)}
                        className={cn(
                          "h-12 min-w-24 border px-5 text-[11px] uppercase tracking-[0.16em]",
                          qty === q
                            ? "border-espresso bg-espresso text-ivory"
                            : "border-espresso/15"
                        )}
                      >
                        {q}g each
                      </button>
                    ))}
                  </div>
                )}

                {step === 3 && (
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, 140))}
                    placeholder="A short note for the recipient…"
                    className="h-40 w-full border border-espresso/15 bg-ivory p-4 text-sm"
                  />
                )}

                {step === 4 && (
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="relative aspect-square overflow-hidden bg-sand">
                      <Image src={box.image} alt={box.name} fill className="object-cover" />
                    </div>
                    <div>
                      <p className="font-serif text-3xl">{box.name} Box</p>
                      <ul className="mt-4 space-y-1 text-sm text-muted">
                        {fruits.map((f) => (
                          <li key={f.id}>
                            {f.name} · {qty}g
                          </li>
                        ))}
                      </ul>
                      {message && (
                        <p className="mt-6 border-l border-champagne pl-4 text-sm italic text-espresso/80">
                          “{message}”
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-10 flex items-center justify-between">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="text-[11px] uppercase tracking-[0.2em] disabled:opacity-30"
              >
                Back
              </button>
              {step < 4 ? (
                <button
                  disabled={!canNext}
                  onClick={() => setStep((s) => s + 1)}
                  className="h-11 bg-espresso px-8 text-[11px] uppercase tracking-[0.22em] text-ivory disabled:opacity-40"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={create}
                  className="h-11 bg-espresso px-8 text-[11px] uppercase tracking-[0.22em] text-ivory"
                >
                  {created ? "Added to bag" : "Create my box"}
                </button>
              )}
            </div>
          </div>

          <aside className="border border-espresso/10 bg-ivory p-6 lg:col-span-5 lg:p-10">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted">Live preview</p>
            <p className="mt-4 font-serif text-4xl">{box.name}</p>
            <p className="mt-2 text-sm text-muted">{box.slots} chambers · {qty}g per selection</p>
            <div className="mt-8 grid grid-cols-3 gap-2">
              {Array.from({ length: box.slots }).map((_, i) => {
                const fruit = fruits[i];
                return (
                  <div key={i} className="relative aspect-square overflow-hidden bg-sand">
                    {fruit ? (
                      <Image src={fruit.image} alt={fruit.name} fill className="object-cover" />
                    ) : (
                      <span className="flex h-full items-center justify-center text-[10px] uppercase tracking-widest text-muted">
                        Empty
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-10 flex items-end justify-between border-t border-espresso/10 pt-6">
              <span className="text-[11px] uppercase tracking-[0.2em] text-muted">Total</span>
              <span className="font-serif text-4xl">{formatINR(total)}</span>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
