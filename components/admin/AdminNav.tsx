"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Percent, ShoppingBag, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/coupons", label: "Coupons", icon: Percent },
];

export default function AdminNav() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <aside className="flex w-full flex-col border-b border-espresso/10 bg-cream md:w-56 md:border-b-0 md:border-r md:min-h-dvh">
      <div className="px-5 py-6 md:px-6">
        <p className="text-[10px] uppercase tracking-[0.28em] text-muted">NOURA</p>
        <h1 className="mt-1 font-serif text-2xl">Admin</h1>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:px-3 md:pb-0">
        {nav.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 whitespace-nowrap px-3 py-2.5 text-[11px] uppercase tracking-[0.18em] transition-colors",
                active ? "bg-espresso text-ivory" : "text-muted hover:text-espresso"
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3 border-t border-espresso/10 px-5 py-5 md:px-6">
        <p className="truncate text-xs text-muted">{user?.email}</p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-muted underline underline-offset-4"
          >
            <Store className="h-3 w-3" strokeWidth={1.5} />
            Storefront
          </Link>
          <button
            type="button"
            onClick={() => signOut()}
            className="text-[10px] uppercase tracking-[0.18em] text-muted underline underline-offset-4"
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
