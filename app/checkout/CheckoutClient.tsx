"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { formatINR } from "@/lib/utils";

export default function CheckoutClient() {
  const searchParams = useSearchParams();
  const canceled = searchParams.get("canceled") === "1";
  const { cart, cartTotal, discount, coupon, applyCoupon, removeCoupon } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const payable = Math.max(0, cartTotal - discount);

  async function handlePay() {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coupon,
          items: cart.map((item) => ({
            name: item.name,
            weight: item.weight,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
        }),
      });

      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Could not start Stripe checkout");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setLoading(false);
    }
  }

  return (
    <div className="bg-ivory pt-24">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-12 md:px-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h1 className="font-serif text-5xl">Checkout</h1>
          {canceled && (
            <p className="mt-4 text-sm text-muted">
              Payment was canceled. You can try again when ready.
            </p>
          )}
          {cart.length === 0 ? (
            <p className="mt-8 text-muted">
              Your bag is empty.{" "}
              <Link href="/shop" className="underline underline-offset-4">
                Visit the shop
              </Link>
              .
            </p>
          ) : (
            <div className="mt-10 space-y-6">
              <p className="max-w-md text-sm text-muted">
                You’ll enter email, delivery address, and card details on Stripe’s secure checkout for this one-time payment.
              </p>
              {error && <p className="text-sm text-red-700">{error}</p>}
              <button
                type="button"
                onClick={handlePay}
                disabled={loading}
                className="h-12 w-full max-w-md bg-espresso text-[11px] uppercase tracking-[0.24em] text-ivory disabled:opacity-60"
              >
                {loading ? "Redirecting to Stripe…" : `Pay with Stripe · ${formatINR(payable)}`}
              </button>
            </div>
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
