export const SITE_NAME = "NOURA";
export const SITE_DEFAULT_TITLE = "NOURA — Premium Dry Fruits, Nuts & Luxury Gift Boxes";
export const SITE_TITLE_TEMPLATE = "%s — NOURA Dry Fruits";
export const SITE_DESCRIPTION =
  "Thoughtfully sourced, artisanal dry fruits and luxury gift boxes. Premium almonds, pistachios, cashews, Kashmiri walnuts, Medjool dates, and curated assortments.";

export const SITE_KEYWORDS = [
  "dry fruits",
  "premium dry fruits",
  "buy dry fruits online",
  "luxury dry fruit gift boxes",
  "almonds",
  "California Mamra almonds",
  "pistachios",
  "Konkan cashews",
  "Kashmiri walnuts",
  "Medjool dates",
  "organic dried fruits",
  "corporate gifting dry fruits",
  "NOURA dry fruits",
  "gourmet nuts",
];

export const getSiteUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL;
  if (envUrl) {
    return envUrl.startsWith("http") ? envUrl : `https://${envUrl}`;
  }
  return "https://noura.world";
};

export const SITE_URL = getSiteUrl();

export function absoluteUrl(path: string = ""): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}
