import type { CategorySlug, WeightVariant } from "@/data/products";

export type ProductFormValues = {
  id?: string;
  name: string;
  slug: string;
  category: CategorySlug;
  origin: string;
  tagline: string;
  description: string;
  details: string;
  ingredients: string;
  storage: string;
  shipping: string;
  images: string;
  variantsJson: string;
  featured: boolean;
  bestseller: boolean;
  active: boolean;
  rating: number;
  review_count: number;
};

const defaultVariants: WeightVariant[] = [
  { label: "250g", grams: 250, price: 499 },
  { label: "500g", grams: 500, price: 899 },
];

export function emptyProductForm(): ProductFormValues {
  return {
    name: "",
    slug: "",
    category: "almonds",
    origin: "",
    tagline: "",
    description: "",
    details: "",
    ingredients: "",
    storage: "",
    shipping: "",
    images: "",
    variantsJson: JSON.stringify(defaultVariants, null, 2),
    featured: false,
    bestseller: false,
    active: true,
    rating: 5,
    review_count: 0,
  };
}
