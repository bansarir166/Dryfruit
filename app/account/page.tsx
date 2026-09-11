import type { Metadata } from "next";
import { Suspense } from "react";
import AccountClient from "./AccountClient";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: false },
};

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
