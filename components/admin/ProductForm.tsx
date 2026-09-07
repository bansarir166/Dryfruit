"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { categories, type CategorySlug, type WeightVariant } from "@/data/products";

export type ProductFormValues = {
  id?: string;
  name: string;
  slug: string;
  category: CategorySlug;
  origin: string;
  tagline: string;
  description: string;
  details: string;
  ingredients: string;
  storage: string;
  shipping: string;
  images: string;
  variantsJson: string;
  featured: boolean;
  bestseller: boolean;
  active: boolean;
  rating: number;
  review_count: number;
};

const defaultVariants: WeightVariant[] = [
  { label: "250g", grams: 250, price: 499 },
  { label: "500g", grams: 500, price: 899 },
];

export function emptyProductForm(): ProductFormValues {
  return {
    name: "",
    slug: "",
    category: "almonds",
    origin: "",
    tagline: "",
    description: "",
    details: "",
    ingredients: "",
    storage: "",
    shipping: "",
    images: "",
    variantsJson: JSON.stringify(defaultVariants, null, 2),
    featured: false,
    bestseller: false,
    active: true,
    rating: 5,
    review_count: 0,
  };
}

type Props = {
  initial: ProductFormValues;
  mode: "create" | "edit";
};

export default function ProductForm({ initial, mode }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    let variants: WeightVariant[];
    try {
      variants = JSON.parse(form.variantsJson);
      if (!Array.isArray(variants) || !variants.length) throw new Error("bad variants");
    } catch {
      setError("Variants must be valid JSON array, e.g. [{ \"label\": \"250g\", \"grams\": 250, \"price\": 499 }]");
      setBusy(false);
      return;
    }

    const images = form.images
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      name: form.name,
      slug: form.slug,
      category: form.category,
      origin: form.origin,
      tagline: form.tagline,
      description: form.description,
      details: form.details,
      ingredients: form.ingredients,
      storage: form.storage,
      shipping: form.shipping,
      images,
      variants,
      featured: form.featured,
      bestseller: form.bestseller,
      active: form.active,
      rating: form.rating,
      review_count: form.review_count,
      nutrition: [],
      reviews: [],
    };

    try {
      const res =
        mode === "create"
          ? await fetch("/api/admin/products", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/admin/products/${encodeURIComponent(form.id!)}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Save failed");
        return;
      }
      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!form.id || !confirm("Delete this product permanently?")) return;
    setBusy(true);
    const res = await fetch(`/api/admin/products/${encodeURIComponent(form.id)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
    } else {
      setError("Delete failed");
      setBusy(false);
    }
  }

  const field =
    "mt-1.5 h-11 w-full border border-espresso/15 bg-ivory px-3 text-sm outline-none focus:border-espresso/40";
  const area =
    "mt-1.5 w-full border border-espresso/15 bg-ivory px-3 py-2 text-sm outline-none focus:border-espresso/40";

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-[10px] uppercase tracking-[0.18em] text-muted">
          Name
          <input
            required
            className={field}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </label>
        <label className="block text-[10px] uppercase tracking-[0.18em] text-muted">
          Slug (URL)
          <input
            required
            className={field}
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-[10px] uppercase tracking-[0.18em] text-muted">
          Category
          <select
            className={field}
            value={form.category}
            onChange={(e) => set("category", e.target.value as CategorySlug)}
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[10px] uppercase tracking-[0.18em] text-muted">
          Origin
          <input
            className={field}
            value={form.origin}
            onChange={(e) => set("origin", e.target.value)}
          />
        </label>
      </div>

      <label className="block text-[10px] uppercase tracking-[0.18em] text-muted">
        Tagline
        <input
          className={field}
          value={form.tagline}
          onChange={(e) => set("tagline", e.target.value)}
        />
      </label>

      <label className="block text-[10px] uppercase tracking-[0.18em] text-muted">
        Description
        <textarea
          rows={3}
          className={area}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </label>

      <label className="block text-[10px] uppercase tracking-[0.18em] text-muted">
        Details
        <textarea
          rows={3}
          className={area}
          value={form.details}
          onChange={(e) => set("details", e.target.value)}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-[10px] uppercase tracking-[0.18em] text-muted">
          Ingredients
          <input
            className={field}
            value={form.ingredients}
            onChange={(e) => set("ingredients", e.target.value)}
          />
        </label>
        <label className="block text-[10px] uppercase tracking-[0.18em] text-muted">
          Storage
          <input
            className={field}
            value={form.storage}
            onChange={(e) => set("storage", e.target.value)}
          />
        </label>
      </div>

      <label className="block text-[10px] uppercase tracking-[0.18em] text-muted">
        Shipping note
        <input
          className={field}
          value={form.shipping}
          onChange={(e) => set("shipping", e.target.value)}
        />
      </label>

      <label className="block text-[10px] uppercase tracking-[0.18em] text-muted">
        Image URLs (one per line)
        <textarea
          rows={3}
          className={area}
          value={form.images}
          onChange={(e) => set("images", e.target.value)}
          placeholder="https://…"
        />
      </label>

      <label className="block text-[10px] uppercase tracking-[0.18em] text-muted">
        Variants (JSON)
        <textarea
          rows={5}
          className={`${area} font-mono text-xs`}
          value={form.variantsJson}
          onChange={(e) => set("variantsJson", e.target.value)}
        />
      </label>

      <div className="flex flex-wrap gap-6 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => set("active", e.target.checked)}
          />
          Active on storefront
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => set("featured", e.target.checked)}
          />
          Featured
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.bestseller}
            onChange={(e) => set("bestseller", e.target.checked)}
          />
          Bestseller
        </label>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={busy}
          className="h-11 bg-espresso px-6 text-[11px] uppercase tracking-[0.2em] text-ivory disabled:opacity-50"
        >
          {busy ? "Saving…" : mode === "create" ? "Create product" : "Save changes"}
        </button>
        {mode === "edit" && (
          <button
            type="button"
            disabled={busy}
            onClick={onDelete}
            className="h-11 border border-red-800/40 px-6 text-[11px] uppercase tracking-[0.2em] text-red-800"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
