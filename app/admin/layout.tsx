import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import { getAdminProfile } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin } = await getAdminProfile();
  if (!isAdmin) redirect("/account?error=admin");

  return (
    <div className="min-h-dvh bg-ivory text-espresso md:flex">
      <AdminNav />
      <div className="min-w-0 flex-1 px-5 py-8 md:px-10 md:py-10">{children}</div>
    </div>
  );
}
