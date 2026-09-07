"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ORDER_STATUSES } from "@/lib/admin";

export default function OrderStatusForm({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save() {
    setBusy(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: value }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Update failed");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Status</p>
      <select
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setSaved(false);
        }}
        className="mt-2 h-11 w-full border border-espresso/15 bg-ivory px-3 text-sm"
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
        {!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number]) && (
          <option value={status}>{status}</option>
        )}
      </select>
      <button
        type="button"
        disabled={busy || value === status}
        onClick={save}
        className="mt-3 h-11 w-full bg-espresso text-[11px] uppercase tracking-[0.2em] text-ivory disabled:opacity-40"
      >
        {busy ? "Saving…" : "Update status"}
      </button>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      {saved && <p className="mt-2 text-sm text-pistachio">Saved</p>}
    </div>
  );
}
