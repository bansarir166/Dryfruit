import { getAllProductsAdmin, catalogUsesDatabase } from "@/lib/catalog";
import AdminProductsClient from "@/components/admin/AdminProductsClient";

export default async function AdminProductsPage() {
  const [products, dbReady] = await Promise.all([
    getAllProductsAdmin(),
    catalogUsesDatabase(),
  ]);

  return <AdminProductsClient products={products} dbReady={dbReady} />;
}
