"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { products } from "@/data/products";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import { createClient } from "@/lib/supabase/client";
import { formatINR } from "@/lib/utils";

type OrderRow = {
  id: string;
  amount_total: number;
  currency: string;
  status: string;
  created_at: string;
  items: { name?: string; weight?: string; quantity?: number; price?: number }[];
};

export default function AccountClient() {
  const { user, loading, configured, signIn, signUp, signOut } = useAuth();
  const { wishlist, toggleWishlist } = useStore();
  const searchParams = useSearchParams();
  const [saved, setSaved] = useState(products.filter((p) => wishlist.includes(p.id)));

  useEffect(() => {
    if (!wishlist.length) {
      setSaved([]);
      return;
    }
    let cancelled = false;
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((data: { products?: typeof products }) => {
        if (cancelled) return;
        const list = data.products || products;
        setSaved(list.filter((p) => wishlist.includes(p.id)));
      })
      .catch(() => {
        if (!cancelled) setSaved(products.filter((p) => wishlist.includes(p.id)));
      });
    return () => {
      cancelled = true;
    };
  }, [wishlist]);

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (searchParams.get("error") === "admin") {
      setError("Admin access required. Sign in with an admin account.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user || !configured) {
      setOrders([]);
      setIsAdmin(false);
      return;
    }

    let cancelled = false;
    setOrdersLoading(true);

    (async () => {
      try {
        const supabase = createClient();
        const [{ data, error: fetchError }, { data: profile }] = await Promise.all([
          supabase
            .from("orders")
            .select("id, amount_total, currency, status, created_at, items")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
          supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
        ]);

        if (!cancelled) {
          if (fetchError) setOrders([]);
          else setOrders((data as OrderRow[]) || []);
          setIsAdmin(profile?.role === "admin");
        }
      } catch {
        if (!cancelled) {
          setOrders([]);
          setIsAdmin(false);
        }
      } finally {
        if (!cancelled) setOrdersLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, configured]);

  async function handleAuth(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const fullName = String(form.get("fullName") || "").trim();

    const result =
      mode === "signin"
        ? await signIn(email, password)
        : await signUp(email, password, fullName);

    if (result.error) setError(result.error);
    setBusy(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-ivory pt-24 text-sm text-muted">
        Loading account…
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="bg-ivory pt-24">
        <div className="mx-auto max-w-[640px] px-5 py-16 md:px-10">
          <h1 className="font-serif text-5xl">Account</h1>
          <p className="mt-4 text-sm text-muted">
            Add your Supabase anon key to <code className="text-espresso">.env.local</code> to
            enable login.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-ivory pt-24">
        <div className="mx-auto max-w-[480px] px-5 py-16 md:px-10">
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Your house</p>
          <h1 className="mt-3 font-serif text-5xl">
            {mode === "signin" ? "Sign in" : "Create account"}
          </h1>
          <p className="mt-4 text-sm text-muted">
            Saved orders and your profile live in Supabase.
          </p>

          <form className="mt-10 space-y-4" onSubmit={handleAuth}>
            {mode === "signup" && (
              <input
                name="fullName"
                placeholder="Full name"
                className="h-12 w-full border border-espresso/15 bg-transparent px-4 text-sm"
              />
            )}
            <input
              required
              name="email"
              type="email"
              placeholder="Email"
              className="h-12 w-full border border-espresso/15 bg-transparent px-4 text-sm"
            />
            <input
              required
              name="password"
              type="password"
              minLength={6}
              placeholder="Password"
              className="h-12 w-full border border-espresso/15 bg-transparent px-4 text-sm"
            />
            {error && <p className="text-sm text-red-700">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="h-12 w-full bg-espresso text-[11px] uppercase tracking-[0.24em] text-ivory disabled:opacity-60"
            >
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
            </button>
          </form>

          <button
            type="button"
            className="mt-6 text-sm text-muted underline underline-offset-4"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
            }}
          >
            {mode === "signin"
              ? "Need an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    );
  }

  const displayName =
    (user.user_metadata?.full_name as string | undefined) || user.email || "Guest";

  return (
    <div className="bg-ivory pt-24">
      <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Your house</p>
            <h1 className="mt-3 font-serif text-5xl md:text-6xl">Account</h1>
            <p className="mt-4 max-w-md text-sm text-muted">Signed in as {displayName}</p>
            {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-6">
            {isAdmin && (
              <Link
                href="/admin"
                className="text-[11px] uppercase tracking-[0.22em] underline underline-offset-8"
              >
                Admin panel
              </Link>
            )}
            <button
              type="button"
              onClick={() => signOut()}
              className="text-[11px] uppercase tracking-[0.22em] underline underline-offset-8"
            >
              Sign out
            </button>
          </div>
        </div>

        <h2 className="mt-16 font-serif text-3xl">Orders</h2>
        {ordersLoading ? (
          <p className="mt-6 text-sm text-muted">Loading orders…</p>
        ) : orders.length === 0 ? (
          <p className="mt-6 text-sm text-muted">
            No orders yet.{" "}
            <Link href="/shop" className="underline underline-offset-4">
              Visit the shop
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-8 divide-y divide-espresso/10">
            {orders.map((order) => (
              <li key={order.id} className="py-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm">
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-sm">{formatINR(order.amount_total / 100)}</p>
                </div>
                <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-muted">
                  {order.status}
                  {order.items?.length
                    ? ` · ${order.items.map((i) => i.name).filter(Boolean).join(", ")}`
                    : ""}
                </p>
              </li>
            ))}
          </ul>
        )}

        <h2 className="mt-16 font-serif text-3xl">Wishlist</h2>
        {saved.length === 0 ? (
          <p className="mt-6 text-sm text-muted">
            Nothing saved yet. Tap the heart on a product to keep it.
          </p>
        ) : (
          <ul className="mt-8 divide-y divide-espresso/10">
            {saved.map((product) => (
              <li key={product.id} className="flex items-center gap-4 py-5">
                <Link
                  href={`/shop/${product.slug}`}
                  className="relative h-20 w-16 overflow-hidden bg-sand"
                >
                  <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                </Link>
                <div className="flex-1">
                  <Link href={`/shop/${product.slug}`} className="text-sm">
                    {product.name}
                  </Link>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-muted">
                    {formatINR(product.variants[0].price)}
                  </p>
                </div>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="text-[10px] uppercase tracking-[0.18em] text-muted"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
