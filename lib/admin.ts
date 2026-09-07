import "server-only";

import { createClient } from "@/lib/supabase/server";

export async function getAdminProfile() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { user: null, isAdmin: false as const, profile: null };

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email, full_name, role")
      .eq("id", user.id)
      .maybeSingle();

    const isAdmin = profile?.role === "admin";
    return { user, isAdmin, profile };
  } catch {
    return { user: null, isAdmin: false as const, profile: null };
  }
}

export {
  ORDER_STATUSES,
  isOrderStatus,
  type OrderStatus,
  type AdminOrder,
  type AdminOrderItem,
} from "@/lib/admin-shared";
