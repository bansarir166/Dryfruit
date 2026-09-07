import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatINR } from "@/lib/utils";
import type { AdminOrder } from "@/lib/admin-shared";

function startOfDayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { data: orders },
    { count: orderCount },
    { data: amountRows },
    { data: todayOrders },
    { count: pipelineCount },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("id, email, amount_total, status, created_at, items")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("amount_total"),
    supabase.from("orders").select("amount_total").gte("created_at", startOfDayISO()),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .in("status", ["paid", "processing", "packed"]),
  ]);

  const recent = (orders || []) as Pick<
    AdminOrder,
    "id" | "email" | "amount_total" | "status" | "created_at" | "items"
  >[];

  const totalRevenue = (amountRows || []).reduce(
    (sum, o) => sum + ((o as { amount_total: number }).amount_total || 0),
    0
  );
  const todayRevenue = (todayOrders || []).reduce(
    (sum, o) => sum + ((o as { amount_total: number }).amount_total || 0),
    0
  );

  const stats = [
    { label: "Orders", value: String(orderCount ?? 0) },
    { label: "Revenue", value: formatINR(totalRevenue / 100) },
    { label: "Today", value: formatINR(todayRevenue / 100) },
    { label: "In pipeline", value: String(pipelineCount ?? 0) },
  ];

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Overview</p>
      <h1 className="mt-2 font-serif text-4xl md:text-5xl">Dashboard</h1>
      <p className="mt-3 max-w-lg text-sm text-muted">
        Control panel for the NOURA storefront — orders, catalog, and coupons. The public shop is
        separate at the storefront link.
      </p>

      <div className="mt-10 grid gap-px bg-espresso/10 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-ivory px-5 py-6">
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted">{stat.label}</p>
            <p className="mt-3 font-serif text-3xl tabular-nums">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 flex items-end justify-between gap-4">
        <h2 className="font-serif text-2xl">Recent orders</h2>
        <Link
          href="/admin/orders"
          className="text-[11px] uppercase tracking-[0.2em] underline underline-offset-4"
        >
          View all
        </Link>
      </div>

      {recent.length === 0 ? (
        <p className="mt-6 text-sm text-muted">No orders yet.</p>
      ) : (
        <ul className="mt-6 divide-y divide-espresso/10 border-t border-espresso/10">
          {recent.map((order) => (
            <li key={order.id}>
              <Link
                href={`/admin/orders/${order.id}`}
                className="flex flex-wrap items-baseline justify-between gap-2 py-4 transition-colors hover:bg-cream/60"
              >
                <div>
                  <p className="text-sm">{order.email || "Guest"}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted">
                    {order.status}
                    {order.items?.length
                      ? ` · ${order.items
                          .map((i) => i.name)
                          .filter(Boolean)
                          .slice(0, 2)
                          .join(", ")}`
                      : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm tabular-nums">{formatINR(order.amount_total / 100)}</p>
                  <p className="mt-1 text-[11px] text-muted">
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
