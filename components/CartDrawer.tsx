"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { formatINR } from "@/lib/utils";

export default function CartDrawer() {
  const {
    cartOpen,
    setCartOpen,
    cart,
    cartTotal,
    discount,
    coupon,
    removeFromCart,
    updateQuantity,
    applyCoupon,
    removeCoupon,
  } = useStore();

  const payable = Math.max(0, cartTotal - discount);

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.button
            aria-label="Close cart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 z-[60] bg-espresso/40"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 z-[70] flex h-dvh w-full max-w-[440px] flex-col bg-ivory"
          >
            <div className="flex items-center justify-between border-b border-espresso/10 px-6 py-5">
              <p className="text-[11px] uppercase tracking-[0.24em]">Your bag</p>
              <button onClick={() => setCartOpen(false)} aria-label="Close">
                <X size={18} strokeWidth={1.4} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="font-serif text-3xl">Your bag is empty</p>
                  <p className="mt-3 max-w-[220px] text-sm text-muted">
                    Begin with almonds, or compose a gift.
                  </p>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="mt-8 text-[11px] uppercase tracking-[0.22em] underline underline-offset-8"
                  >
                    Continue browsing
                  </button>
                </div>
              ) : (
                <ul className="space-y-6">
                  {cart.map((item) => (
                    <li key={item.key} className="flex gap-4">
                      <Link
                        href={`/shop/${item.slug}`}
                        onClick={() => setCartOpen(false)}
                        className="relative h-24 w-20 shrink-0 overflow-hidden bg-sand"
                      >
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </Link>
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between gap-3">
                          <div>
                            <p className="text-sm">{item.name}</p>
                            <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-muted">
                              {item.weight}
                            </p>
                          </div>
                          <p className="text-sm">{formatINR(item.price * item.quantity)}</p>
                        </div>
                        <div className="mt-auto flex items-center justify-between pt-3">
                          <div className="flex items-center border border-espresso/15">
                            <button
                              className="px-2 py-1"
                              onClick={() => updateQuantity(item.key, item.quantity - 1)}
                              aria-label="Decrease"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-7 text-center text-xs">{item.quantity}</span>
                            <button
                              className="px-2 py-1"
                              onClick={() => updateQuantity(item.key, item.quantity + 1)}
                              aria-label="Increase"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.key)}
                            className="text-[10px] uppercase tracking-[0.18em] text-muted hover:text-espresso"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-espresso/10 px-6 py-5">
                <CouponRow
                  coupon={coupon}
                  onApply={applyCoupon}
                  onRemove={removeCoupon}
                />
                <div className="mt-4 flex justify-between text-sm">
                  <span className="text-muted">Subtotal</span>
                  <span>{formatINR(cartTotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="mt-1 flex justify-between text-sm text-pistachio">
                    <span>Discount</span>
                    <span>−{formatINR(discount)}</span>
                  </div>
                )}
                <div className="mt-3 flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatINR(payable)}</span>
                </div>
                <Link
                  href="/checkout"
                  onClick={() => setCartOpen(false)}
                  className="mt-5 flex h-12 items-center justify-center bg-espresso text-[11px] uppercase tracking-[0.24em] text-ivory transition-colors hover:bg-ink"
                >
                  Checkout
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function CouponRow({
  coupon,
  onApply,
  onRemove,
}: {
  coupon: string | null;
  onApply: (code: string) => boolean | Promise<boolean>;
  onRemove: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const code = String(data.get("coupon") || "");
        void onApply(code);
      }}
      className="flex gap-2"
    >
      {coupon ? (
        <div className="flex w-full items-center justify-between border border-espresso/15 px-3 py-2 text-xs">
          <span className="tracking-[0.16em] uppercase">{coupon} applied</span>
          <button type="button" onClick={onRemove} className="text-muted">
            Remove
          </button>
        </div>
      ) : (
        <>
          <input
            name="coupon"
            placeholder="Coupon code"
            className="h-10 flex-1 border border-espresso/15 bg-transparent px-3 text-xs tracking-[0.08em]"
          />
          <button
            type="submit"
            className="h-10 px-4 text-[10px] uppercase tracking-[0.2em] border border-espresso/20"
          >
            Apply
          </button>
        </>
      )}
    </form>
  );
}
