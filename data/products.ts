export type CategorySlug =
  | "almonds"
  | "cashews"
  | "pistachios"
  | "walnuts"
  | "dates"
  | "dried-fruits"
  | "seeds"
  | "gift-boxes";

export type WeightVariant = {
  label: string;
  grams: number;
  price: number;
};

export type Review = {
  id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: CategorySlug;
  origin: string;
  tagline: string;
  description: string;
  details: string;
  ingredients: string;
  nutrition: { label: string; value: string }[];
  storage: string;
  shipping: string;
  rating: number;
  reviewCount: number;
  images: string[];
  variants: WeightVariant[];
  featured?: boolean;
  bestseller?: boolean;
  reviews: Review[];
};

export type CollectionItem = {
  number: string;
  name: string;
  slug: CategorySlug;
  description: string;
  image: string;
};

export const categories: CollectionItem[] = [
  {
    number: "01",
    name: "Almonds",
    slug: "almonds",
    description: "California Nonpareil and rare Mamra, selected for sweetness and snap.",
    image:
      "https://images.unsplash.com/photo-1579282940892-6152e6e80c52?auto=format&fit=crop&w=1600&q=80",
  },
  {
    number: "02",
    name: "Cashews",
    slug: "cashews",
    description: "Whole jumbo kernels, pale and buttery, from the Konkan coast.",
    image:
      "https://images.unsplash.com/photo-1524593656068-fbac72624bb0?auto=format&fit=crop&w=1600&q=80",
  },
  {
    number: "03",
    name: "Pistachios",
    slug: "pistachios",
    description: "Iranian and Antep pistachios with a naturally vivid green heart.",
    image:
      "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1600&q=80",
  },
  {
    number: "04",
    name: "Walnuts",
    slug: "walnuts",
    description: "Light, crisp halves from Kashmiri orchards, never bitter.",
    image:
      "https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&w=1600&q=80",
  },
  {
    number: "05",
    name: "Dates",
    slug: "dates",
    description: "Medjool and amber honey dates, plump, caramel-sweet, and clean.",
    image:
      "https://images.unsplash.com/photo-1600189083288-89e1c8b9b0cc?auto=format&fit=crop&w=1600&q=80",
  },
  {
    number: "06",
    name: "Dried Fruits",
    slug: "dried-fruits",
    description: "Apricots, figs, and berries dried slowly to keep their character.",
    image:
      "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1600&q=80",
  },
  {
    number: "07",
    name: "Seeds",
    slug: "seeds",
    description: "Pumpkin, chia, and flax — quietly nutritious, carefully cleaned.",
    image:
      "https://images.unsplash.com/photo-1543208541-0961a29a8c3d?auto=format&fit=crop&w=1600&q=80",
  },
  {
    number: "08",
    name: "Gift Boxes",
    slug: "gift-boxes",
    description: "Composed assortments, wrapped as one would wrap a letter.",
    image:
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1600&q=80",
  },
];

export const galleryImages = [
  {
    src: "https://images.unsplash.com/photo-1769255485022-f9bb6d6e8169?auto=format&fit=crop&w=1400&q=80",
    alt: "Mixed nuts in a ceramic bowl",
    span: "lg:col-span-6 lg:row-span-2",
  },
  {
    src: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=900&q=80",
    alt: "Tied gift box with ribbon",
    span: "lg:col-span-3",
  },
  {
    src: "https://images.unsplash.com/photo-1579282940892-6152e6e80c52?auto=format&fit=crop&w=900&q=80",
    alt: "Almonds on linen",
    span: "lg:col-span-3",
  },
  {
    src: "https://images.unsplash.com/photo-1600189083288-89e1c8b9b0cc?auto=format&fit=crop&w=900&q=80",
    alt: "Dates on a dark plate",
    span: "lg:col-span-4",
  },
  {
    src: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=900&q=80",
    alt: "Table setting with fruit",
    span: "lg:col-span-4",
  },
  {
    src: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&w=900&q=80",
    alt: "Kraft packaging still life",
    span: "lg:col-span-4",
  },
];

export const testimonials = [
  {
    quote:
      "Beautiful packaging, exceptional quality, and the freshest pistachios we've had.",
    author: "Verified Customer",
    place: "Mumbai",
  },
  {
    quote:
      "The Medjool dates arrived like jewellery — plump, glossy, and impossibly sweet.",
    author: "Verified Customer",
    place: "London",
  },
  {
    quote:
      "We sent the Signature box to a client. It was opened at the table and finished before dessert.",
    author: "Verified Customer",
    place: "Dubai",
  },
];

const sharedReviews = (name: string): Review[] => [
  {
    id: `${name}-1`,
    author: "Ananya M.",
    rating: 5,
    title: "Quietly outstanding",
    body: "The flavour is clean and the texture is exactly as it should be. Packaging felt considered, not loud.",
    date: "12 August 2026",
    verified: true,
  },
  {
    id: `${name}-2`,
    author: "Rohit S.",
    rating: 5,
    title: "Gifted, and asked for more",
    body: "Sent this as a host gift. The box looked as expensive as it tasted. Will reorder.",
    date: "3 July 2026",
    verified: true,
  },
  {
    id: `${name}-3`,
    author: "Leah K.",
    rating: 4,
    title: "Fresh, generous, well packed",
    body: "Arrived quickly and well sealed. A little more snap than I expected — in the best way.",
    date: "21 June 2026",
    verified: true,
  },
];

export const products: Product[] = [
  {
    id: "p-almonds-royal",
    slug: "royal-california-almonds",
    name: "Royal California Almonds",
    category: "almonds",
    origin: "Central Valley, California",
    tagline: "Sweet, pale, and quietly crunchy.",
    description:
      "Nonpareil almonds chosen for their long shape and pale skin. A clean, milky sweetness with a snap that holds through the last handful.",
    details:
      "Hand-sorted Nonpareil almonds. No oil, no salt, no coating — only the nut, as grown. Packed in small batches to protect aroma and crunch.",
    ingredients: "100% California Nonpareil almonds.",
    nutrition: [
      { label: "Energy", value: "579 kcal" },
      { label: "Protein", value: "21 g" },
      { label: "Fat", value: "50 g" },
      { label: "Carbohydrate", value: "22 g" },
      { label: "Fibre", value: "13 g" },
    ],
    storage: "Keep sealed, cool, and away from light. Best within 90 days of opening.",
    shipping: "Dispatched within 24 hours. Cold-pack available for summer orders.",
    rating: 4.9,
    reviewCount: 186,
    images: [
      "https://images.unsplash.com/photo-1579282940892-6152e6e80c52?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1508779018996-601e37fa274e?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1769255485022-f9bb6d6e8169?auto=format&fit=crop&w=1600&q=80",
    ],
    variants: [
      { label: "250g", grams: 250, price: 499 },
      { label: "500g", grams: 500, price: 899 },
      { label: "1kg", grams: 1000, price: 1699 },
    ],
    featured: true,
    bestseller: true,
    reviews: sharedReviews("almonds"),
  },
  {
    id: "p-pistachio-iran",
    slug: "iranian-pistachios",
    name: "Iranian Pistachios",
    category: "pistachios",
    origin: "Kerman, Iran",
    tagline: "Deep green, naturally salted by the orchard.",
    description:
      "Long, elegant kernels from Kerman. The colour is vivid without dye; the flavour is round, almost buttery, with a faint mineral finish.",
    details:
      "Open-mouth Ahmad Aghaei pistachios, roasted lightly if at all. Selected for kernel size, colour, and a clean split.",
    ingredients: "100% Iranian pistachios.",
    nutrition: [
      { label: "Energy", value: "562 kcal" },
      { label: "Protein", value: "20 g" },
      { label: "Fat", value: "45 g" },
      { label: "Carbohydrate", value: "28 g" },
      { label: "Fibre", value: "10 g" },
    ],
    storage: "Store airtight. Refrigerate in warmer months to keep the oils fresh.",
    shipping: "Dispatched within 24 hours in opaque, aroma-safe pouches.",
    rating: 4.9,
    reviewCount: 214,
    images: [
      "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1769255485022-f9bb6d6e8169?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1600&q=80",
    ],
    variants: [
      { label: "250g", grams: 250, price: 649 },
      { label: "500g", grams: 500, price: 1199 },
      { label: "1kg", grams: 1000, price: 2299 },
    ],
    featured: true,
    bestseller: true,
    reviews: sharedReviews("pistachio"),
  },
  {
    id: "p-cashew-jumbo",
    slug: "premium-jumbo-cashews",
    name: "Premium Jumbo Cashews",
    category: "cashews",
    origin: "Konkan, India",
    tagline: "Whole, pale, and almost creamy.",
    description:
      "W-180 jumbo cashews with a soft crunch and a sweet, milky centre. No fragments, no dark spots — only the largest, palest kernels.",
    details:
      "Single-origin Konkan cashews, steam-opened and graded by hand. Unsalted, unroasted unless noted on the pouch.",
    ingredients: "100% cashew kernels (Anacardium occidentale).",
    nutrition: [
      { label: "Energy", value: "553 kcal" },
      { label: "Protein", value: "18 g" },
      { label: "Fat", value: "44 g" },
      { label: "Carbohydrate", value: "30 g" },
      { label: "Fibre", value: "3 g" },
    ],
    storage: "Keep cool and dry. Consume within two months of opening for best texture.",
    shipping: "Dispatched within 24 hours. Gift wrap available at checkout.",
    rating: 4.8,
    reviewCount: 163,
    images: [
      "https://images.unsplash.com/photo-1524593656068-fbac72624bb0?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1769255485022-f9bb6d6e8169?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1543208541-0961a29a8c3d?auto=format&fit=crop&w=1600&q=80",
    ],
    variants: [
      { label: "250g", grams: 250, price: 549 },
      { label: "500g", grams: 500, price: 999 },
      { label: "1kg", grams: 1000, price: 1899 },
    ],
    featured: true,
    bestseller: true,
    reviews: sharedReviews("cashew"),
  },
  {
    id: "p-dates-medjool",
    slug: "medjool-dates",
    name: "Medjool Dates",
    category: "dates",
    origin: "Jordan Valley",
    tagline: "Caramel flesh, paper-thin skin.",
    description:
      "Large Medjool dates with a glossy skin and a honeyed, almost toffee centre. Soft enough to press, firm enough to slice.",
    details:
      "Picked at peak ripeness and packed to retain moisture. Each date is individually inspected. No syrup, no oil.",
    ingredients: "100% Medjool dates.",
    nutrition: [
      { label: "Energy", value: "277 kcal" },
      { label: "Protein", value: "2 g" },
      { label: "Fat", value: "0.2 g" },
      { label: "Carbohydrate", value: "75 g" },
      { label: "Fibre", value: "7 g" },
    ],
    storage: "Refrigerate after opening. Bring to room temperature before serving.",
    shipping: "Shipped in cushioned trays to protect the fruit.",
    rating: 4.9,
    reviewCount: 142,
    images: [
      "https://images.unsplash.com/photo-1600189083288-89e1c8b9b0cc?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1605027990121-cbae9e0642df?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1600&q=80",
    ],
    variants: [
      { label: "250g", grams: 250, price: 429 },
      { label: "500g", grams: 500, price: 749 },
      { label: "1kg", grams: 1000, price: 1399 },
    ],
    featured: true,
    bestseller: true,
    reviews: sharedReviews("dates"),
  },
  {
    id: "p-almonds-mamra",
    slug: "mamra-almonds",
    name: "Mamra Almonds",
    category: "almonds",
    origin: "Iran & Afghanistan",
    tagline: "Rare, oil-rich, and naturally sweet.",
    description:
      "Small, wrinkled Mamra almonds with a higher natural oil content. They roast in the mouth rather than snap — a quieter luxury.",
    details:
      "Limited harvest. Gurbandi Mamra, never bleached. Best eaten as they are, or warmed briefly.",
    ingredients: "100% Mamra almonds.",
    nutrition: [
      { label: "Energy", value: "598 kcal" },
      { label: "Protein", value: "20 g" },
      { label: "Fat", value: "54 g" },
      { label: "Carbohydrate", value: "19 g" },
      { label: "Fibre", value: "11 g" },
    ],
    storage: "Keep airtight. The oils are delicate — avoid heat.",
    shipping: "Packed in small lots. Dispatched twice weekly.",
    rating: 4.8,
    reviewCount: 91,
    images: [
      "https://images.unsplash.com/photo-1508779018996-601e37fa274e?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1579282940892-6152e6e80c52?auto=format&fit=crop&w=1600&q=80",
    ],
    variants: [
      { label: "250g", grams: 250, price: 899 },
      { label: "500g", grams: 500, price: 1699 },
      { label: "1kg", grams: 1000, price: 3199 },
    ],
    bestseller: true,
    reviews: sharedReviews("mamra"),
  },
  {
    id: "p-walnut-kashmir",
    slug: "kashmiri-walnuts",
    name: "Kashmiri Walnuts",
    category: "walnuts",
    origin: "Anantnag, Kashmir",
    tagline: "Light halves, never bitter.",
    description:
      "Paper-shell Kashmiri walnuts with a pale kernel and a clean, almost floral finish. Selected to avoid the tannic bite of lesser lots.",
    details:
      "Shelled with care to keep halves intact. No sulphur. A winter staple, equally at home on a cheese board.",
    ingredients: "100% Kashmiri walnut kernels.",
    nutrition: [
      { label: "Energy", value: "654 kcal" },
      { label: "Protein", value: "15 g" },
      { label: "Fat", value: "65 g" },
      { label: "Carbohydrate", value: "14 g" },
      { label: "Fibre", value: "7 g" },
    ],
    storage: "Refrigerate. Walnut oils turn if left warm.",
    shipping: "Dispatched in opaque pouches with an oxygen absorber.",
    rating: 4.7,
    reviewCount: 77,
    images: [
      "https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1769255485022-f9bb6d6e8169?auto=format&fit=crop&w=1600&q=80",
    ],
    variants: [
      { label: "250g", grams: 250, price: 549 },
      { label: "500g", grams: 500, price: 999 },
      { label: "1kg", grams: 1000, price: 1899 },
    ],
    reviews: sharedReviews("walnut"),
  },
  {
    id: "p-pistachio-antep",
    slug: "antep-pistachios",
    name: "Antep Pistachios",
    category: "pistachios",
    origin: "Gaziantep, Turkey",
    tagline: "Smaller kernel, deeper flavour.",
    description:
      "The pistachio bakers reach for. A concentrated, almost resinous taste and a colour that stains pastry a proper green.",
    details:
      "Siirt and Antep lots, lightly roasted. Excellent eaten from the hand; exceptional in cooking.",
    ingredients: "100% Turkish pistachios.",
    nutrition: [
      { label: "Energy", value: "560 kcal" },
      { label: "Protein", value: "21 g" },
      { label: "Fat", value: "44 g" },
      { label: "Carbohydrate", value: "27 g" },
      { label: "Fibre", value: "10 g" },
    ],
    storage: "Airtight, cool, dark.",
    shipping: "Dispatched within 24 hours.",
    rating: 4.8,
    reviewCount: 64,
    images: [
      "https://images.unsplash.com/photo-1769255485022-f9bb6d6e8169?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1600&q=80",
    ],
    variants: [
      { label: "250g", grams: 250, price: 699 },
      { label: "500g", grams: 500, price: 1299 },
      { label: "1kg", grams: 1000, price: 2499 },
    ],
    reviews: sharedReviews("antep"),
  },
  {
    id: "p-raisin-golden",
    slug: "golden-raisins",
    name: "Golden Raisins",
    category: "dried-fruits",
    origin: "Nashik, India",
    tagline: "Sun-warmed, not syrupy.",
    description:
      "Thompson seedless grapes dried until they turn amber. A gentle sweetness, a little chew, no cloying finish.",
    details:
      "Shade-dried to keep colour even. Un-oiled. Rinse only if you wish — they are clean as packed.",
    ingredients: "100% dried grapes.",
    nutrition: [
      { label: "Energy", value: "299 kcal" },
      { label: "Protein", value: "3 g" },
      { label: "Fat", value: "0.5 g" },
      { label: "Carbohydrate", value: "79 g" },
      { label: "Fibre", value: "4 g" },
    ],
    storage: "Cool and dry. Separate from strong spices.",
    shipping: "Dispatched within 24 hours.",
    rating: 4.6,
    reviewCount: 58,
    images: [
      "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1464454709131-ffd692591ee5?auto=format&fit=crop&w=1600&q=80",
    ],
    variants: [
      { label: "250g", grams: 250, price: 299 },
      { label: "500g", grams: 500, price: 549 },
      { label: "1kg", grams: 1000, price: 999 },
    ],
    reviews: sharedReviews("raisin"),
  },
  {
    id: "p-apricot-turkish",
    slug: "turkish-apricots",
    name: "Turkish Apricots",
    category: "dried-fruits",
    origin: "Malatya, Turkey",
    tagline: "Soft, tart, and the colour of late afternoon.",
    description:
      "Whole dried apricots from Malatya. They keep a little acidity, which is the point — sweetness without fatigue.",
    details:
      "Sulphur used only where required to hold colour, declared on pack. Pitted. Ready to eat or to stew.",
    ingredients: "Dried apricots. May contain traces of sulphur dioxide.",
    nutrition: [
      { label: "Energy", value: "241 kcal" },
      { label: "Protein", value: "3 g" },
      { label: "Fat", value: "0.5 g" },
      { label: "Carbohydrate", value: "63 g" },
      { label: "Fibre", value: "7 g" },
    ],
    storage: "Airtight. If they firm up, a night in a sealed jar with a slice of apple restores them.",
    shipping: "Dispatched within 24 hours.",
    rating: 4.7,
    reviewCount: 49,
    images: [
      "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1600&q=80",
    ],
    variants: [
      { label: "250g", grams: 250, price: 379 },
      { label: "500g", grams: 500, price: 699 },
      { label: "1kg", grams: 1000, price: 1299 },
    ],
    reviews: sharedReviews("apricot"),
  },
  {
    id: "p-figs-anatolia",
    slug: "anatolian-figs",
    name: "Anatolian Figs",
    category: "dried-fruits",
    origin: "Aydın, Turkey",
    tagline: "Honeyed, seeded, and generous.",
    description:
      "Dried Bursa and Aydın figs with a jammy centre and a faint crackle of seed. Excellent after dinner, or torn over yoghurt.",
    details:
      "Naturally dried. No glucose bath. Size 1–2, the larger fruit.",
    ingredients: "100% dried figs.",
    nutrition: [
      { label: "Energy", value: "249 kcal" },
      { label: "Protein", value: "3 g" },
      { label: "Fat", value: "1 g" },
      { label: "Carbohydrate", value: "64 g" },
      { label: "Fibre", value: "10 g" },
    ],
    storage: "Cool, dry, sealed. A white bloom of natural sugar is harmless.",
    shipping: "Packed to avoid crushing.",
    rating: 4.8,
    reviewCount: 41,
    images: [
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1600&q=80",
    ],
    variants: [
      { label: "250g", grams: 250, price: 449 },
      { label: "500g", grams: 500, price: 829 },
      { label: "1kg", grams: 1000, price: 1549 },
    ],
    bestseller: true,
    reviews: sharedReviews("figs"),
  },
  {
    id: "p-seeds-pumpkin",
    slug: "organic-pumpkin-seeds",
    name: "Organic Pumpkin Seeds",
    category: "seeds",
    origin: "Styria, Austria",
    tagline: "Dark, nutty, and faintly green.",
    description:
      "Hull-less Styrian seeds with a deep, roasted flavour even when raw. A handful in the afternoon, or over soup.",
    details:
      "Organic, unsalted. The oil is vivid; keep them from the sun.",
    ingredients: "100% organic pumpkin seeds.",
    nutrition: [
      { label: "Energy", value: "559 kcal" },
      { label: "Protein", value: "30 g" },
      { label: "Fat", value: "49 g" },
      { label: "Carbohydrate", value: "11 g" },
      { label: "Fibre", value: "6 g" },
    ],
    storage: "Refrigerate after opening.",
    shipping: "Dispatched within 24 hours.",
    rating: 4.7,
    reviewCount: 36,
    images: [
      "https://images.unsplash.com/photo-1543208541-0961a29a8c3d?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1524593656068-fbac72624bb0?auto=format&fit=crop&w=1600&q=80",
    ],
    variants: [
      { label: "250g", grams: 250, price: 349 },
      { label: "500g", grams: 500, price: 629 },
      { label: "1kg", grams: 1000, price: 1149 },
    ],
    reviews: sharedReviews("pumpkin"),
  },
  {
    id: "p-seeds-blend",
    slug: "chia-flax-blend",
    name: "Chia & Flax Blend",
    category: "seeds",
    origin: "Bolivia & Canada",
    tagline: "A quiet daily ritual.",
    description:
      "Black chia and golden flax in equal measure. For porridge, dough, or a glass of water left to gel overnight.",
    details:
      "Milled flax is packed separately on request. This blend is whole seed, for those who prefer to grind at home.",
    ingredients: "Chia seeds, flax seeds.",
    nutrition: [
      { label: "Energy", value: "490 kcal" },
      { label: "Protein", value: "18 g" },
      { label: "Fat", value: "34 g" },
      { label: "Carbohydrate", value: "32 g" },
      { label: "Fibre", value: "28 g" },
    ],
    storage: "Cool and dark. Grind flax as needed.",
    shipping: "Dispatched within 24 hours.",
    rating: 4.6,
    reviewCount: 29,
    images: [
      "https://images.unsplash.com/photo-1543208541-0961a29a8c3d?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=1600&q=80",
    ],
    variants: [
      { label: "250g", grams: 250, price: 329 },
      { label: "500g", grams: 500, price: 579 },
      { label: "1kg", grams: 1000, price: 1049 },
    ],
    reviews: sharedReviews("blend"),
  },
  {
    id: "p-dates-honey",
    slug: "honey-dates",
    name: "Honey Dates",
    category: "dates",
    origin: "Saudi Arabia",
    tagline: "Amber, translucent, and gently floral.",
    description:
      "Sukkari dates with a lighter body than Medjool and a perfume that recalls orange blossom. Best chilled.",
    details:
      "Soft grade, vacuum-packed to keep the sheen. No added sugar.",
    ingredients: "100% Sukkari dates.",
    nutrition: [
      { label: "Energy", value: "282 kcal" },
      { label: "Protein", value: "2 g" },
      { label: "Fat", value: "0.4 g" },
      { label: "Carbohydrate", value: "75 g" },
      { label: "Fibre", value: "8 g" },
    ],
    storage: "Refrigerate. Serve cool.",
    shipping: "Cushioned trays. Dispatched within 24 hours.",
    rating: 4.8,
    reviewCount: 53,
    images: [
      "https://images.unsplash.com/photo-1605027990121-cbae9e0642df?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600189083288-89e1c8b9b0cc?auto=format&fit=crop&w=1600&q=80",
    ],
    variants: [
      { label: "250g", grams: 250, price: 399 },
      { label: "500g", grams: 500, price: 699 },
      { label: "1kg", grams: 1000, price: 1299 },
    ],
    reviews: sharedReviews("honey-dates"),
  },
  {
    id: "p-gift-classic",
    slug: "classic-gift-box",
    name: "Classic Gift Box",
    category: "gift-boxes",
    origin: "Composed in our atelier",
    tagline: "Four favourites, quietly wrapped.",
    description:
      "Almonds, cashews, pistachios, and raisins in a rigid ivory box, lined and ribboned. An introduction to the house.",
    details:
      "Four 150g tins. A handwritten card can be added at checkout. Suitable for personal and corporate sending.",
    ingredients: "Almonds, cashews, pistachios, raisins. See inner tins for allergens.",
    nutrition: [
      { label: "Serves", value: "8–10" },
      { label: "Net weight", value: "600 g" },
    ],
    storage: "Cool and dry. Best within six weeks.",
    shipping: "Gift-ready. Nationwide, with optional named-day delivery.",
    rating: 4.9,
    reviewCount: 118,
    images: [
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=1600&q=80",
    ],
    variants: [{ label: "600g", grams: 600, price: 1899 }],
    featured: false,
    bestseller: true,
    reviews: sharedReviews("classic-box"),
  },
  {
    id: "p-gift-signature",
    slug: "signature-gift-box",
    name: "Signature Gift Box",
    category: "gift-boxes",
    origin: "Composed in our atelier",
    tagline: "The box we send ourselves.",
    description:
      "Six chambers: Mamra almonds, Iranian pistachios, jumbo cashews, Medjool dates, figs, and golden raisins.",
    details:
      "Presented in a champagne-lined rigid box with a wax seal. Includes a tasting card.",
    ingredients: "Almonds, pistachios, cashews, dates, figs, raisins.",
    nutrition: [
      { label: "Serves", value: "12–14" },
      { label: "Net weight", value: "900 g" },
    ],
    storage: "Cool and dry. Dates prefer the refrigerator after opening.",
    shipping: "White-glove packing. Named-day available.",
    rating: 5,
    reviewCount: 87,
    images: [
      "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1600&q=80",
    ],
    variants: [{ label: "900g", grams: 900, price: 3299 }],
    bestseller: true,
    reviews: sharedReviews("signature-box"),
  },
  {
    id: "p-gift-grand",
    slug: "grand-gift-box",
    name: "Grand Gift Box",
    category: "gift-boxes",
    origin: "Composed in our atelier",
    tagline: "For the table that must not be ordinary.",
    description:
      "Eight selections in a large architectural box. Built for Diwali, boardrooms, and weddings that require a presence.",
    details:
      "Includes a personal note, tasting card, and optional branded sleeve for corporate orders of twelve or more.",
    ingredients: "A full house assortment. Allergen list enclosed.",
    nutrition: [
      { label: "Serves", value: "18–20" },
      { label: "Net weight", value: "1.6 kg" },
    ],
    storage: "Cool and dry. Open the dates tin last, and chill it.",
    shipping: "Scheduled delivery. Signature on receipt.",
    rating: 4.9,
    reviewCount: 44,
    images: [
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1725537895955-c3fb9bcb6d23?auto=format&fit=crop&w=1600&q=80",
    ],
    variants: [{ label: "1.6kg", grams: 1600, price: 5499 }],
    reviews: sharedReviews("grand-box"),
  },
];

export const boxBuilderOptions = {
  boxes: [
    {
      id: "classic",
      name: "Classic",
      slots: 4,
      basePrice: 499,
      description: "A compact ivory box. Four chambers.",
      image:
        "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "signature",
      name: "Signature",
      slots: 6,
      basePrice: 799,
      description: "Champagne lining, wax seal, six chambers.",
      image:
        "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "grand",
      name: "Grand",
      slots: 8,
      basePrice: 1299,
      description: "Architectural, ribboned, eight chambers.",
      image:
        "https://images.unsplash.com/photo-1725537895955-c3fb9bcb6d23?auto=format&fit=crop&w=900&q=80",
    },
  ],
  fruits: [
    { id: "almonds", name: "Almonds", pricePer100g: 180, image: products[0].images[0] },
    { id: "cashews", name: "Cashews", pricePer100g: 200, image: products[2].images[0] },
    { id: "pistachios", name: "Pistachios", pricePer100g: 240, image: products[1].images[0] },
    { id: "walnuts", name: "Walnuts", pricePer100g: 200, image: products[5].images[0] },
    { id: "dates", name: "Dates", pricePer100g: 150, image: products[3].images[0] },
    { id: "raisins", name: "Raisins", pricePer100g: 110, image: products[7].images[0] },
  ],
  quantities: [100, 150, 200, 250],
};

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(slug: CategorySlug) {
  return products.filter((p) => p.category === slug);
}

export function getFeaturedProducts() {
  return products.filter((p) => p.featured).slice(0, 4);
}

export function getBestsellers() {
  return products.filter((p) => p.bestseller);
}

export function searchProducts(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.includes(q) ||
      p.origin.toLowerCase().includes(q) ||
      p.tagline.toLowerCase().includes(q)
  );
}

export function sortProducts(
  list: Product[],
  sort: "featured" | "price-asc" | "price-desc" | "name"
) {
  const copy = [...list];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.variants[0].price - b.variants[0].price);
    case "price-desc":
      return copy.sort((a, b) => b.variants[0].price - a.variants[0].price);
    case "name":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return copy.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
  }
}
