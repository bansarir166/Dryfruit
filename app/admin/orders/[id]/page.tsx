import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatINR } from "@/lib/utils";
import type { AdminOrder } from "@/lib/admin-shared";
import OrderStatusForm from "@/components/admin/OrderStatusForm";

type Props = { params: Promise<{ id: string }> };

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) notFound();

  const order = data as AdminOrder;
  const shipping = order.shipping as {
    name?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
    phone?: string;
  } | null;

  return (
    <div>
      <Link
        href="/admin/orders"
        className="text-[11px] uppercase tracking-[0.2em] text-muted underline underline-offset-4"
      >
        All orders
      </Link>
      <h1 className="mt-4 font-serif text-4xl md:text-5xl">Order</h1>
      <p className="mt-2 font-mono text-xs text-muted">{order.id}</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_280px]">
        <div>
          <h2 className="text-[11px] uppercase tracking-[0.22em] text-muted">Items</h2>
          <ul className="mt-4 divide-y divide-espresso/10 border-t border-espresso/10">
            {(order.items || []).map((item, i) => (
              <li key={i} className="flex justify-between gap-4 py-4 text-sm">
                <div>
                  <p>{item.name || "Item"}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted">
                    {item.weight || ""}
                    {item.quantity ? ` · ×${item.quantity}` : ""}
                  </p>
                </div>
                {typeof item.price === "number" && (
                  <p className="tabular-nums">{formatINR(item.price)}</p>
                )}
              </li>
            ))}
          </ul>

          {shipping && (
            <div className="mt-10">
              <h2 className="text-[11px] uppercase tracking-[0.22em] text-muted">Shipping</h2>
              <div className="mt-4 space-y-1 text-sm text-muted">
                {shipping.name && <p className="text-espresso">{shipping.name}</p>}
                {shipping.phone && <p>{shipping.phone}</p>}
                {shipping.address?.line1 && <p>{shipping.address.line1}</p>}
                {shipping.address?.line2 && <p>{shipping.address.line2}</p>}
                <p>
                  {[shipping.address?.city, shipping.address?.state, shipping.address?.postal_code]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                {shipping.address?.country && <p>{shipping.address.country}</p>}
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-6 border border-espresso/10 bg-cream/40 p-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Customer</p>
            <p className="mt-2 text-sm">{order.email || "—"}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Placed</p>
            <p className="mt-2 text-sm">
              {new Date(order.created_at).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Total</p>
            <p className="mt-2 font-serif text-2xl tabular-nums">
              {formatINR(order.amount_total / 100)}
            </p>
          </div>
          {order.stripe_session_id && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Stripe</p>
              <p className="mt-2 break-all font-mono text-[11px] text-muted">
                {order.stripe_session_id}
              </p>
            </div>
          )}
          <OrderStatusForm orderId={order.id} status={order.status} />
        </aside>
      </div>
    </div>
  );
}
