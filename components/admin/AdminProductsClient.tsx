"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatINR } from "@/lib/utils";
import type { Product } from "@/data/products";

type Row = Product & { active: boolean };

export default function AdminProductsClient({
  products,
  dbReady,
}: {
  products: Row[];
  dbReady: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function seedCatalog() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/products", { method: "PUT" });
      const data = (await res.json()) as { error?: string; count?: number };
      if (!res.ok) {
        setMessage(data.error || "Import failed — run catalog-migration.sql first");
        return;
      }
      setMessage(`Imported ${data.count} products into the database.`);
      router.refresh();
    } catch {
      setMessage("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Catalog</p>
          <h1 className="mt-2 font-serif text-4xl md:text-5xl">Products</h1>
          <p className="mt-3 max-w-xl text-sm text-muted">
            Edit what appears on the shop. Changes go live on the storefront after save.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {!dbReady && (
            <button
              type="button"
              disabled={busy}
              onClick={seedCatalog}
              className="h-11 border border-espresso/20 px-4 text-[11px] uppercase tracking-[0.18em] disabled:opacity-50"
            >
              {busy ? "Importing…" : "Import catalog"}
            </button>
          )}
          <Link
            href="/admin/products/new"
            className="inline-flex h-11 items-center bg-espresso px-4 text-[11px] uppercase tracking-[0.18em] text-ivory"
          >
            Add product
          </Link>
        </div>
      </div>

      {message && <p className="mt-4 text-sm text-pistachio">{message}</p>}

      {!dbReady && (
        <p className="mt-6 border border-champagne/50 bg-cream/50 px-4 py-3 text-sm text-muted">
          No products in the database yet. Run{" "}
          <code className="text-espresso">supabase/catalog-migration.sql</code> in Supabase, then
          click <strong className="font-medium text-espresso">Import catalog</strong>.
        </p>
      )}

      {products.length > 0 && (
        <div className="mt-10 overflow-x-auto border-t border-espresso/10">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-espresso/10 text-[10px] uppercase tracking-[0.18em] text-muted">
                <th className="py-3 pr-4 font-medium">Product</th>
                <th className="py-3 pr-4 font-medium">Category</th>
                <th className="py-3 pr-4 font-medium">From</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 text-right font-medium">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-espresso/10">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-cream/50">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-10 shrink-0 overflow-hidden bg-sand">
                        {product.images[0] && (
                          <Image
                            src={product.images[0]}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        )}
                      </div>
                      <div>
                        <p>{product.name}</p>
                        <p className="mt-0.5 text-[11px] text-muted">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 capitalize text-muted">
                    {product.category.replace(/-/g, " ")}
                  </td>
                  <td className="py-3 pr-4 tabular-nums">
                    {formatINR(product.variants[0]?.price ?? 0)}
                  </td>
                  <td className="py-3 pr-4 text-[11px] uppercase tracking-[0.14em]">
                    {product.active ? (
                      <span className="text-pistachio">Live</span>
                    ) : (
                      <span className="text-muted">Hidden</span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-[11px] uppercase tracking-[0.16em] underline underline-offset-4"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
