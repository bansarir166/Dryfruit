import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Newsletter from "@/components/Newsletter";

export const metadata: Metadata = { title: "Our Story" };

const faqs = [
  {
    q: "Where do you source from?",
    a: "California for Nonpareil almonds, Kerman for pistachios, Konkan for cashews, Kashmir for walnuts, and the Jordan Valley for Medjool dates. We buy from named orchards, not from mixed commodity lots.",
  },
  {
    q: "Do you add oil, salt, or sugar?",
    a: "Not unless a product is labelled otherwise. Our house style is the ingredient as it arrives from the tree.",
  },
  {
    q: "How quickly do you ship?",
    a: "Orders placed before 2pm IST leave the same day. Named-day delivery is available for gift boxes.",
  },
];

export default function StoryPage() {
  return (
    <div className="bg-ivory pt-24">
      <section className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-24">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted">The house</p>
        <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[0.95] md:text-7xl">
          We buy slowly, pack quietly, and send only what we would keep.
        </h1>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-espresso/70">
          NOURA began as a family pantry and became a house of dry fruits. The name is a nod to
          light — the kind that falls on an orchard in late afternoon.
        </p>
      </section>

      <section className="grid lg:grid-cols-2">
        <div className="relative min-h-[420px]">
          <Image
            src="https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=1600&q=80"
            alt="Sourcing"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col justify-center bg-cream px-5 py-16 md:px-16">
          <h2 className="font-serif text-4xl md:text-5xl">A longer look at the tree</h2>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-espresso/75">
            We visit growers more than we visit trade fairs. Size, moisture, and a clean finish
            matter more than volume. If a harvest is ordinary, we wait for the next.
          </p>
        </div>
      </section>

      <section id="quality" className="mx-auto max-w-[1440px] px-5 py-24 md:px-10">
        <h2 className="font-serif text-5xl">Quality, without ceremony</h2>
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {[
            { t: "Sourcing", d: "Named orchards. Named harvests. No blending across seasons." },
            { t: "Handling", d: "Small batches, opaque pouches, and a cold store for summer." },
            { t: "The table", d: "Packed as if it were leaving our kitchen, not a warehouse." },
          ].map((item) => (
            <div key={item.t} className="border-t border-espresso/15 pt-6">
              <p className="font-serif text-3xl">{item.t}</p>
              <p className="mt-3 text-sm text-muted">{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="shipping" className="bg-cream px-5 py-20 md:px-10">
        <div className="mx-auto grid max-w-[1440px] gap-12 md:grid-cols-2">
          <div>
            <h2 className="font-serif text-4xl">Shipping</h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
              Complimentary shipping on orders over ₹2,500. Gift boxes travel in rigid cartons with
              a signature on receipt when requested.
            </p>
          </div>
          <div id="returns">
            <h2 className="font-serif text-4xl">Returns</h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
              Unopened pouches may be returned within 7 days. Perishable opened goods cannot be
              restocked — write to us and we will make it right.
            </p>
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-[900px] px-5 py-20 md:px-10">
        <h2 className="font-serif text-4xl">FAQs</h2>
        <ul className="mt-10 divide-y divide-espresso/10">
          {faqs.map((item) => (
            <li key={item.q} className="py-6">
              <p className="font-medium">{item.q}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.a}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="privacy" className="mx-auto max-w-[900px] px-5 pb-8 text-sm text-muted">
        <h2 className="font-serif text-3xl text-espresso">Privacy</h2>
        <p className="mt-3">
          We keep only what is needed to fulfil an order. We do not sell lists. Cards are processed
          by a PCI-compliant partner; we never store the number.
        </p>
      </section>
      <section id="terms" className="mx-auto max-w-[900px] px-5 pb-16 text-sm text-muted">
        <h2 className="font-serif text-3xl text-espresso">Terms</h2>
        <p className="mt-3">
          Goods remain ours until paid for. Descriptions are honest; harvests vary. Please read
          allergen statements on each product.
        </p>
      </section>

      <section id="contact" className="bg-espresso px-5 py-20 text-ivory md:px-10">
        <div className="mx-auto max-w-[1440px]">
          <h2 className="font-serif text-5xl">Contact</h2>
          <p className="mt-6 text-ivory/70">
            hello@noura.world
            <br />
            14, Quiet Lane, Bandra West, Mumbai
          </p>
          <Link href="/gifting#corporate" className="mt-8 inline-block text-[11px] uppercase tracking-[0.22em] underline underline-offset-8">
            Corporate enquiries
          </Link>
        </div>
      </section>
      <Newsletter />
    </div>
  );
}
