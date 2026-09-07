"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { clearCart, hydrated, setCartOpen } = useStore();
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    clearCart();
    setCartOpen(false);
  }, [hydrated, clearCart, setCartOpen]);

  useEffect(() => {
    if (!sessionId || !user || !isSupabaseConfigured() || saved) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/checkout/session?session_id=${encodeURIComponent(sessionId)}`);
        if (!res.ok) return;
        const data = (await res.json()) as {
          email?: string | null;
          amount_total?: number | null;
          currency?: string | null;
          items?: unknown[];
          shipping?: unknown;
        };

        const supabase = createClient();
        const { error } = await supabase.from("orders").insert({
          user_id: user.id,
          email: data.email || user.email,
          stripe_session_id: sessionId,
          amount_total: data.amount_total ?? 0,
          currency: data.currency ?? "inr",
          status: "paid",
          items: data.items ?? [],
          shipping: data.shipping ?? null,
        });

        if (!cancelled && !error) setSaved(true);
      } catch {
        /* order save is best-effort */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId, user, saved]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-ivory px-5 pt-24 text-center">
      <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Payment confirmed</p>
      <h1 className="mt-4 font-serif text-5xl">Thank you.</h1>
      <p className="mt-4 max-w-md text-muted">
        Your payment went through with Stripe. We pack in the morning and leave by afternoon.
      </p>
      <div className="mt-10 flex flex-col items-center gap-4">
        <Link href="/account" className="text-[11px] uppercase tracking-[0.22em] underline underline-offset-8">
          View account
        </Link>
        <Link href="/shop" className="text-[11px] uppercase tracking-[0.22em] text-muted underline underline-offset-8">
          Continue browsing
        </Link>
      </div>
    </div>
  );
}
