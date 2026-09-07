import { createClient } from "@/lib/supabase/server";
import AdminCouponsClient from "@/components/admin/AdminCouponsClient";

export default async function AdminCouponsPage() {
  let coupons: { code: string; percent: number; active: boolean }[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("coupons").select("code, percent, active").order("code");
    coupons = (data || []).map((c) => ({
      code: c.code,
      percent: Number(c.percent),
      active: c.active,
    }));
  } catch {
    coupons = [];
  }

  return <AdminCouponsClient coupons={coupons} />;
}
