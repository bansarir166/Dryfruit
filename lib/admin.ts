import { createClient } from "@/lib/supabase/server";

export const ORDER_STATUSES = [
  "paid",
  "processing",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type AdminOrderItem = {
  name?: string;
  weight?: string;
  quantity?: number;
  price?: number;
};

export type AdminOrder = {
  id: string;
  user_id: string | null;
  email: string | null;
  stripe_session_id: string | null;
  amount_total: number;
  currency: string;
  status: string;
  items: AdminOrderItem[];
  shipping: Record<string, unknown> | null;
  created_at: string;
};

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

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}
