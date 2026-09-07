import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { StoreProvider } from "@/context/StoreContext";
import { AuthProvider } from "@/context/AuthContext";
import SiteShell from "@/components/SiteShell";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NOURA — Nature, Refined.",
    template: "%s — NOURA",
  },
  description:
    "Premium dry fruits, thoughtfully sourced and beautifully packed. Almonds, pistachios, cashews, dates and luxury gift boxes.",
  icons: {
    icon: "/favicon.svg",
  },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${outfit.variable}`}>
      <body className="bg-ivory text-espresso font-sans antialiased">
        <AuthProvider>
          <StoreProvider>
            <SiteShell>{children}</SiteShell>
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
