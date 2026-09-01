"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product, WeightVariant } from "@/data/products";

export type CartItem = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  weight: string;
  price: number;
  quantity: number;
};

type StoreContextValue = {
  cart: CartItem[];
  wishlist: string[];
  cartCount: number;
  cartTotal: number;
  coupon: string | null;
  discount: number;
  hydrated: boolean;
  cartOpen: boolean;
  searchOpen: boolean;
  setCartOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  addToCart: (product: Product, variant: WeightVariant, quantity?: number) => void;
  addCustomItem: (item: Omit<CartItem, "key">) => void;
  removeFromCart: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
};

const CART_KEY = "noura-cart";
const WISH_KEY = "noura-wishlist";
const COUPON_KEY = "noura-coupon";

const COUPONS: Record<string, number> = {
  NOURA10: 0.1,
  GIFT20: 0.2,
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [coupon, setCoupon] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    try {
      const c = localStorage.getItem(CART_KEY);
      const w = localStorage.getItem(WISH_KEY);
      const p = localStorage.getItem(COUPON_KEY);
      if (c) setCart(JSON.parse(c));
      if (w) setWishlist(JSON.parse(w));
      if (p) setCoupon(p);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(WISH_KEY, JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (coupon) localStorage.setItem(COUPON_KEY, coupon);
    else localStorage.removeItem(COUPON_KEY);
  }, [coupon, hydrated]);

  const addToCart = useCallback(
    (product: Product, variant: WeightVariant, quantity = 1) => {
      const key = `${product.id}-${variant.label}`;
      setCart((prev) => {
        const existing = prev.find((i) => i.key === key);
        if (existing) {
          return prev.map((i) =>
            i.key === key ? { ...i, quantity: i.quantity + quantity } : i
          );
        }
        return [
          ...prev,
          {
            key,
            productId: product.id,
            slug: product.slug,
            name: product.name,
            image: product.images[0],
            weight: variant.label,
            price: variant.price,
            quantity,
          },
        ];
      });
      setCartOpen(true);
    },
    []
  );

  const addCustomItem = useCallback((item: Omit<CartItem, "key">) => {
    const key = `${item.productId}-${Date.now()}`;
    setCart((prev) => [...prev, { ...item, key }]);
    setCartOpen(true);
  }, []);

  const removeFromCart = useCallback((key: string) => {
    setCart((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    if (quantity < 1) {
      setCart((prev) => prev.filter((i) => i.key !== key));
      return;
    }
    setCart((prev) => prev.map((i) => (i.key === key ? { ...i, quantity } : i)));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setCoupon(null);
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  }, []);

  const isWishlisted = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist]
  );

  const applyCoupon = useCallback((code: string) => {
    const normalised = code.trim().toUpperCase();
    if (COUPONS[normalised]) {
      setCoupon(normalised);
      return true;
    }
    return false;
  }, []);

  const removeCoupon = useCallback(() => setCoupon(null), []);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const discount = useMemo(() => {
    if (!coupon) return 0;
    return Math.round(cartTotal * (COUPONS[coupon] ?? 0));
  }, [coupon, cartTotal]);

  const value = useMemo(
    () => ({
      cart,
      wishlist,
      cartCount,
      cartTotal,
      coupon,
      discount,
      hydrated,
      cartOpen,
      searchOpen,
      setCartOpen,
      setSearchOpen,
      addToCart,
      addCustomItem,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleWishlist,
      isWishlisted,
      applyCoupon,
      removeCoupon,
    }),
    [
      cart,
      wishlist,
      cartCount,
      cartTotal,
      coupon,
      discount,
      hydrated,
      cartOpen,
      searchOpen,
      addToCart,
      addCustomItem,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleWishlist,
      isWishlisted,
      applyCoupon,
      removeCoupon,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
