import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  paid: "text-pistachio",
  processing: "text-champagne",
  packed: "text-gold",
  shipped: "text-espresso",
  delivered: "text-pistachio",
  cancelled: "text-red-700",
};

export default function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "text-[11px] uppercase tracking-[0.16em]",
        tones[status] || "text-muted"
      )}
    >
      {status}
    </span>
  );
}
