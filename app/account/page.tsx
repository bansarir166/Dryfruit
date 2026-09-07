import { Suspense } from "react";
import AccountClient from "./AccountClient";

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-ivory pt-24 text-sm text-muted">
          Loading account…
        </div>
      }
    >
      <AccountClient />
    </Suspense>
  );
}
