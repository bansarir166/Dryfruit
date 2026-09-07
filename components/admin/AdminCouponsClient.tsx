"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Coupon = { code: string; percent: number; active: boolean };

export default function AdminCouponsClient({ coupons: initial }: { coupons: Coupon[] }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [percentOff, setPercentOff] = useState("10");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addCoupon(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const percent = Number(percentOff) / 100;
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, percent, active: true }),
    });
    const data = (await res.json()) as { error?: string };
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    setCode("");
    router.refresh();
  }

  async function toggle(c: Coupon) {
    await fetch(`/api/admin/coupons/${encodeURIComponent(c.code)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !c.active }),
    });
    router.refresh();
  }

  async function remove(c: Coupon) {
    if (!confirm(`Delete coupon ${c.code}?`)) return;
    await fetch(`/api/admin/coupons/${encodeURIComponent(c.code)}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Promotions</p>
      <h1 className="mt-2 font-serif text-4xl md:text-5xl">Coupons</h1>
      <p className="mt-3 text-sm text-muted">
        Codes applied in the cart and validated at Stripe checkout.
      </p>

      <form onSubmit={addCoupon} className="mt-10 flex flex-wrap items-end gap-3">
        <label className="text-[10px] uppercase tracking-[0.18em] text-muted">
          Code
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="mt-1.5 block h-11 w-40 border border-espresso/15 bg-ivory px-3 text-sm"
            placeholder="SAVE15"
          />
        </label>
        <label className="text-[10px] uppercase tracking-[0.18em] text-muted">
          % off
          <input
            required
            type="number"
            min={1}
            max={100}
            value={percentOff}
            onChange={(e) => setPercentOff(e.target.value)}
            className="mt-1.5 block h-11 w-24 border border-espresso/15 bg-ivory px-3 text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="h-11 bg-espresso px-5 text-[11px] uppercase tracking-[0.18em] text-ivory disabled:opacity-50"
        >
          Add
        </button>
      </form>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

      <ul className="mt-10 divide-y divide-espresso/10 border-t border-espresso/10">
        {initial.length === 0 ? (
          <li className="py-6 text-sm text-muted">No coupons yet. Run catalog migration to seed NOURA10 / GIFT20.</li>
        ) : (
          initial.map((c) => (
            <li key={c.code} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-mono text-sm">{c.code}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted">
                  {Math.round(Number(c.percent) * 100)}% off · {c.active ? "Active" : "Off"}
                </p>
              </div>
              <div className="flex gap-4 text-[11px] uppercase tracking-[0.16em]">
                <button type="button" onClick={() => toggle(c)} className="underline underline-offset-4">
                  {c.active ? "Disable" : "Enable"}
                </button>
                <button
                  type="button"
                  onClick={() => remove(c)}
                  className="text-red-800 underline underline-offset-4"
                >
                  Delete
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
