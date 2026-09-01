"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { formatINR } from "@/lib/utils";

export default function CheckoutPage() {
  const { cart, cartTotal, discount, coupon, applyCoupon, removeCoupon, clearCart } = useStore();
  const [placed, setPlaced] = useState(false);
  const payable = Math.max(0, cartTotal - discount);

  if (placed) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-ivory px-5 pt-24 text-center">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Order received</p>
        <h1 className="mt-4 font-serif text-5xl">Thank you.</h1>
        <p className="mt-4 max-w-md text-muted">
          A confirmation is on its way. We pack in the morning and leave by afternoon.
        </p>
        <Link href="/shop" className="mt-10 text-[11px] uppercase tracking-[0.22em] underline underline-offset-8">
          Continue browsing
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-ivory pt-24">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-12 md:px-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h1 className="font-serif text-5xl">Checkout</h1>
          {cart.length === 0 ? (
            <p className="mt-8 text-muted">
              Your bag is empty.{" "}
              <Link href="/shop" className="underline underline-offset-4">
                Visit the shop
              </Link>
              .
            </p>
          ) : (
            <form
              className="mt-10 space-y-10"
              onSubmit={(e) => {
                e.preventDefault();
                clearCart();
                setPlaced(true);
              }}
            >
              <fieldset>
                <legend className="text-[11px] uppercase tracking-[0.22em]">Contact</legend>
                <input
                  required
                  type="email"
                  placeholder="Email"
                  className="mt-4 h-12 w-full border border-espresso/15 bg-transparent px-4 text-sm"
                />
              </fieldset>
              <fieldset>
                <legend className="text-[11px] uppercase tracking-[0.22em]">Delivery</legend>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <input required placeholder="First name" className="h-12 border border-espresso/15 bg-transparent px-4 text-sm" />
                  <input required placeholder="Last name" className="h-12 border border-espresso/15 bg-transparent px-4 text-sm" />
                </div>
                <input required placeholder="Address" className="mt-3 h-12 w-full border border-espresso/15 bg-transparent px-4 text-sm" />
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <input required placeholder="City" className="h-12 border border-espresso/15 bg-transparent px-4 text-sm" />
                  <input required placeholder="State" className="h-12 border border-espresso/15 bg-transparent px-4 text-sm" />
                  <input required placeholder="PIN" className="h-12 border border-espresso/15 bg-transparent px-4 text-sm" />
                </div>
                <input required placeholder="Phone" className="mt-3 h-12 w-full border border-espresso/15 bg-transparent px-4 text-sm" />
              </fieldset>
              <fieldset>
                <legend className="text-[11px] uppercase tracking-[0.22em]">Payment</legend>
                <p className="mt-3 text-sm text-muted">
                  This is a demonstration checkout. No payment is processed.
                </p>
                <input placeholder="Card number" className="mt-4 h-12 w-full border border-espresso/15 bg-transparent px-4 text-sm" />
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <input placeholder="MM / YY" className="h-12 border border-espresso/15 bg-transparent px-4 text-sm" />
                  <input placeholder="CVC" className="h-12 border border-espresso/15 bg-transparent px-4 text-sm" />
                </div>
              </fieldset>
              <button
                type="submit"
                className="h-12 w-full bg-espresso text-[11px] uppercase tracking-[0.24em] text-ivory"
              >
                Place order · {formatINR(payable)}
              </button>
            </form>
          )}
        </div>

        <aside className="lg:col-span-5">
          <div className="border border-espresso/10 bg-cream/50 p-6 md:p-8">
            <p className="text-[11px] uppercase tracking-[0.22em]">Order summary</p>
            <ul className="mt-6 space-y-4">
              {cart.map((item) => (
                <li key={item.key} className="flex gap-4">
                  <div className="relative h-16 w-14 overflow-hidden bg-sand">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 text-sm">
                    <p>{item.name}</p>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-muted">
                      {item.weight} · ×{item.quantity}
                    </p>
                  </div>
                  <p className="text-sm">{formatINR(item.price * item.quantity)}</p>
                </li>
              ))}
            </ul>
            <form
              className="mt-6 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const code = String(new FormData(e.currentTarget).get("coupon") || "");
                applyCoupon(code);
              }}
            >
              {coupon ? (
                <div className="flex w-full items-center justify-between border border-espresso/15 px-3 py-2 text-xs">
                  <span>{coupon} applied</span>
                  <button type="button" onClick={removeCoupon}>
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <input
                    name="coupon"
                    placeholder="Coupon"
                    className="h-10 flex-1 border border-espresso/15 bg-transparent px-3 text-xs"
                  />
                  <button type="submit" className="h-10 border border-espresso/20 px-4 text-[10px] uppercase tracking-[0.18em]">
                    Apply
                  </button>
                </>
              )}
            </form>
            <p className="mt-2 text-[11px] text-muted">Try NOURA10 or GIFT20</p>
            <div className="mt-6 space-y-2 border-t border-espresso/10 pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span>{formatINR(cartTotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-pistachio">
                  <span>Discount</span>
                  <span>−{formatINR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 text-base">
                <span>Total</span>
                <span>{formatINR(payable)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
