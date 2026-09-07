import { Suspense } from "react";
import CheckoutSuccessClient from "./CheckoutSuccessClient";

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-ivory pt-24 text-sm text-muted">
          Confirming payment…
        </div>
      }
    >
      <CheckoutSuccessClient />
    </Suspense>
  );
}
