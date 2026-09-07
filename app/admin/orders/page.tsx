import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatINR } from "@/lib/utils";
import type { AdminOrder } from "@/lib/admin-shared";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, email, amount_total, currency, status, items, created_at")
    .order("created_at", { ascending: false });

  const orders = (data || []) as Pick<
    AdminOrder,
    "id" | "email" | "amount_total" | "currency" | "status" | "items" | "created_at"
  >[];

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Fulfillment</p>
      <h1 className="mt-2 font-serif text-4xl md:text-5xl">Orders</h1>
      <p className="mt-3 text-sm text-muted">
        {error ? "Could not load orders. Check RLS admin policies." : `${orders.length} total`}
      </p>

      {orders.length === 0 ? (
        <p className="mt-10 text-sm text-muted">No orders in the database yet.</p>
      ) : (
        <div className="mt-10 overflow-x-auto border-t border-espresso/10">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-espresso/10 text-[10px] uppercase tracking-[0.18em] text-muted">
                <th className="py-3 pr-4 font-medium">Date</th>
                <th className="py-3 pr-4 font-medium">Customer</th>
                <th className="py-3 pr-4 font-medium">Items</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-espresso/10">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-cream/50">
                  <td className="py-4 pr-4 whitespace-nowrap">
                    <Link href={`/admin/orders/${order.id}`} className="underline-offset-4 hover:underline">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </Link>
                  </td>
                  <td className="py-4 pr-4">{order.email || "—"}</td>
                  <td className="max-w-[220px] truncate py-4 pr-4 text-muted">
                    {order.items?.map((i) => i.name).filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="py-4 pr-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="py-4 text-right tabular-nums">
                    <Link href={`/admin/orders/${order.id}`}>
                      {formatINR(order.amount_total / 100)}
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
