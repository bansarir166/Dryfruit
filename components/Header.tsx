"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { cn } from "@/lib/utils";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/collections", label: "Collections" },
  { href: "/story", label: "Our Story" },
  { href: "/gifting", label: "Gifting" },
];

export default function Header() {
  const pathname = usePathname();
  const { cartCount, setCartOpen, setSearchOpen } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const solid = !isHome || scrolled || open;
  const light = isHome && !solid;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          solid
            ? "bg-ivory/92 backdrop-blur-md border-b border-espresso/8"
            : "bg-transparent border-b border-transparent",
          light && "border-b border-ivory/8"
        )}
      >
        <div className="mx-auto grid h-[72px] max-w-[1440px] grid-cols-3 items-center px-5 md:px-10">
          <Link href="/" className="justify-self-start tracking-[0.28em]">
            <span
              className={cn(
                "font-serif text-[22px] font-semibold leading-none transition-colors duration-500",
                light ? "text-ivory" : "text-espresso"
              )}
            >
              NOURA
            </span>
          </Link>

          <nav className="hidden justify-self-center md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-[11px] uppercase tracking-[0.22em] transition-colors",
                  light
                    ? pathname.startsWith(link.href)
                      ? "text-ivory"
                      : "text-ivory/55 hover:text-ivory"
                    : pathname.startsWith(link.href)
                      ? "text-espresso"
                      : "text-espresso/60 hover:text-espresso"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 justify-self-end">
            <button
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className={cn(
                "transition-colors",
                light ? "text-ivory/75 hover:text-ivory" : "text-espresso/80 hover:text-espresso"
              )}
            >
              <Search size={18} strokeWidth={1.4} />
            </button>
            <Link
              href="/account"
              aria-label="Account"
              className={cn(
                "hidden sm:block transition-colors",
                light ? "text-ivory/75 hover:text-ivory" : "text-espresso/80 hover:text-espresso"
              )}
            >
              <User size={18} strokeWidth={1.4} />
            </Link>
            <button
              aria-label="Cart"
              onClick={() => setCartOpen(true)}
              className={cn(
                "relative transition-colors",
                light ? "text-ivory/75 hover:text-ivory" : "text-espresso/80 hover:text-espresso"
              )}
            >
              <ShoppingBag size={18} strokeWidth={1.4} />
              {cartCount > 0 && (
                <span
                  className={cn(
                    "absolute -right-2.5 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px]",
                    light ? "bg-ivory text-espresso" : "bg-espresso text-ivory"
                  )}
                >
                  {cartCount}
                </span>
              )}
            </button>
            <button
              aria-label="Menu"
              onClick={() => setOpen((v) => !v)}
              className={cn("md:hidden transition-colors", light ? "text-ivory" : "text-espresso")}
            >
              {open ? <X size={20} strokeWidth={1.4} /> : <Menu size={20} strokeWidth={1.4} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-ivory pt-24 md:hidden"
          >
            <nav className="flex flex-col px-8">
              {links.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <Link
                    href={link.href}
                    className="block border-b border-espresso/10 py-5 font-serif text-4xl"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
