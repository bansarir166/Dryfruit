import Link from "next/link";
import ProductForm, { emptyProductForm } from "@/components/admin/ProductForm";

export default function AdminNewProductPage() {
  return (
    <div>
      <Link
        href="/admin/products"
        className="text-[11px] uppercase tracking-[0.2em] text-muted underline underline-offset-4"
      >
        Products
      </Link>
      <h1 className="mt-4 font-serif text-4xl">New product</h1>
      <div className="mt-10">
        <ProductForm mode="create" initial={emptyProductForm()} />
      </div>
    </div>
  );
}
