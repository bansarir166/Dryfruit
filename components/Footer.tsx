import Link from "next/link";
import { Instagram, Facebook } from "lucide-react";

function PinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12.04 2C7.7 2 5 4.9 5 8.4c0 2.16 1.15 4.84 2.92 4.84.3 0 .57-.16.66-.5.07-.26.24-.9.31-1.18.1-.37.06-.5-.22-.82-.62-.74-1.02-1.7-1.02-2.43 0-3.14 2.36-5.95 6.16-5.95 3.36 0 5.22 2.06 5.22 4.81 0 3.62-1.6 6.68-3.98 6.68-1.31 0-2.3-1.09-1.98-2.42.38-1.6 1.11-3.32 1.11-4.47 0-1.03-.55-1.89-1.7-1.89-1.35 0-2.43 1.4-2.43 3.27 0 1.2.4 2 .4 2L9.1 20.3c-.32 1.35-.05 3 .02 3.17h.01c.43-.6 1.17-2.33 1.63-4.47.13-.6.74-2.88.74-2.88.37.7 1.43 1.31 2.56 1.31 3.37 0 5.66-3.07 5.66-7.18C19.72 5.1 16.7 2 12.04 2z" />
    </svg>
  );
}

const columns = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All Products" },
      { href: "/collections/almonds", label: "Almonds" },
      { href: "/collections/cashews", label: "Cashews" },
      { href: "/collections/pistachios", label: "Pistachios" },
      { href: "/collections/dates", label: "Dates" },
      { href: "/collections/gift-boxes", label: "Gift Boxes" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/story", label: "Our Story" },
      { href: "/story#quality", label: "Quality" },
      { href: "/story#contact", label: "Contact" },
      { href: "/story#faq", label: "FAQs" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { href: "/story#shipping", label: "Shipping" },
      { href: "/story#returns", label: "Returns" },
      { href: "/story#privacy", label: "Privacy" },
      { href: "/story#terms", label: "Terms" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-espresso text-ivory">
      <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-24">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="font-serif text-4xl tracking-[0.2em]">NOURA</p>
            <p className="mt-3 text-sm tracking-[0.18em] uppercase text-ivory/55">
              Nature, Refined.
            </p>
            <p className="mt-8 max-w-xs text-sm leading-relaxed text-ivory/60">
              Premium dry fruits, sourced with patience and packed with care.
            </p>
            <div className="mt-8 flex gap-5 text-ivory/70">
              <a href="https://instagram.com" aria-label="Instagram" className="hover:text-ivory">
                <Instagram size={18} strokeWidth={1.4} />
              </a>
              <a href="https://facebook.com" aria-label="Facebook" className="hover:text-ivory">
                <Facebook size={18} strokeWidth={1.4} />
              </a>
              <a href="https://pinterest.com" aria-label="Pinterest" className="hover:text-ivory">
                <PinIcon className="h-[18px] w-[18px]" />
              </a>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title} className="lg:col-span-2">
              <p className="text-[11px] uppercase tracking-[0.22em] text-champagne">{col.title}</p>
              <ul className="mt-6 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-ivory/65 transition-colors hover:text-ivory"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="lg:col-span-2">
            <p className="text-[11px] uppercase tracking-[0.22em] text-champagne">Atelier</p>
            <p className="mt-6 text-sm leading-relaxed text-ivory/65">
              14, Quiet Lane
              <br />
              Bandra West, Mumbai
              <br />
              hello@noura.world
            </p>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-ivory/10 pt-8 text-[11px] uppercase tracking-[0.18em] text-ivory/40 md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} NOURA. All rights reserved.</p>
          <p>Crafted for the table, not the shelf.</p>
        </div>
      </div>
    </footer>
  );
}
