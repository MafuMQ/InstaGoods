import { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import { Product } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  hasCheckedCart: boolean;
}

const CART_STORAGE_KEY = "instagoods_cart";

// Load cart from localStorage
const loadCartFromStorage = (): CartItem[] => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save cart to localStorage
const saveCartToStorage = (items: CartItem[]): void => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Failed to save cart to localStorage:", error);
  }
};

// Map a DB products row to the frontend Product shape
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDbProduct = (p: any): Product => ({
  id: p.id,
  name: p.name,
  description: p.description || "",
  price: p.price,
  image: p.image_url || "",
  mainCategory: p.main_category || "",
  subCategory: p.sub_category || "",
  supplierId: p.supplier_id || "",
  rating: 0,
  reviews: 0,
  region: p.delivery_location || undefined,
  location:
    p.delivery_lat && p.delivery_lng
      ? { lat: p.delivery_lat, lng: p.delivery_lng }
      : undefined,
  deliveryRadiusKm: p.delivery_radius_km || undefined,
  availableEverywhere: p.available_everywhere || false,
  delivery_fee: p.delivery_fee || undefined,
  collection_available: p.collection_available || false,
  no_delivery: p.no_delivery || false,
});

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [hasCheckedCart, setHasCheckedCart] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  // Ref so Supabase helpers can read the current userId without stale closures
  const userIdRef = useRef<string | null>(null);
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = loadCartFromStorage();
    setCartItems(storedCart);
    setHasCheckedCart(true);
  }, []);

  // Auth listener — merge with Supabase cart when the user logs in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (uid) mergeWithSupabase(uid);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (event === "SIGNED_IN" && uid) mergeWithSupabase(uid);
    });

    return () => subscription.unsubscribe();
  // mergeWithSupabase is stable (no deps) — only needs to run once
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save cart to localStorage whenever cartItems changes (only after initial load)
  useEffect(() => {
    if (hasCheckedCart) {
      saveCartToStorage(cartItems);
    }
  }, [cartItems, hasCheckedCart]);

  /** On login: load Supabase cart, merge local-only items in, then set state. */
  const mergeWithSupabase = async (uid: string) => {
    const { data, error } = await supabase
      .from("customer_carts")
      .select("product_id, quantity, products(*)")
      .eq("user_id", uid);

    if (error || !data) return;

    // Exclude deleted (null join) and deactivated products
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const remoteItems: CartItem[] = data
      .filter((row) => row.products && (row.products as any).is_active !== false)
      .map((row) => ({
        ...mapDbProduct(row.products),
        quantity: row.quantity,
      }));

    // Read localStorage directly so we don't depend on stale state
    const localItems = loadCartFromStorage();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    // Split local-only items into UUID (DB products) and static (local-only data)
    const localOnly = localItems.filter((local) => !remoteItems.find((r) => r.id === local.id));
    const localOnlyUuids = localOnly.filter((i) => uuidRegex.test(i.id));
    const localOnlyStatic = localOnly.filter((i) => !uuidRegex.test(i.id));

    // Validate UUID items still exist and are active before merging/upserting
    let validUuidItems: CartItem[] = [];
    if (localOnlyUuids.length > 0) {
      const { data: validProducts } = await supabase
        .from("products")
        .select("id")
        .in("id", localOnlyUuids.map((i) => i.id))
        .eq("is_active", true);
      const validIds = new Set((validProducts ?? []).map((p) => p.id));
      validUuidItems = localOnlyUuids.filter((i) => validIds.has(i.id));
    }

    if (validUuidItems.length > 0) {
      await supabase.from("customer_carts").upsert(
        validUuidItems.map((i) => ({
          user_id: uid,
          product_id: i.id,
          quantity: i.quantity,
          updated_at: new Date().toISOString(),
        }))
      );
    }

    setCartItems([...remoteItems, ...validUuidItems, ...localOnlyStatic]);
  };

  // ---------------------------------------------------------------------------
  // Supabase helpers (fire-and-forget — localStorage is the immediate source of
  // truth; Supabase is updated asynchronously in the background)
  // ---------------------------------------------------------------------------
  const upsertSupabaseItem = (productId: string, quantity: number) => {
    const uid = userIdRef.current;
    if (!uid) return;
    supabase
      .from("customer_carts")
      .upsert(
        { user_id: uid, product_id: productId, quantity, updated_at: new Date().toISOString() },
        { onConflict: "user_id,product_id" }
      )
      .then(() => {});
  };

  const deleteSupabaseItem = (productId: string) => {
    const uid = userIdRef.current;
    if (!uid) return;
    supabase
      .from("customer_carts")
      .delete()
      .eq("user_id", uid)
      .eq("product_id", productId)
      .then(() => {});
  };

  const clearSupabaseCart = () => {
    const uid = userIdRef.current;
    if (!uid) return;
    supabase.from("customer_carts").delete().eq("user_id", uid).then(() => {});
  };

  // ---------------------------------------------------------------------------
  // Public mutations
  // ---------------------------------------------------------------------------
  const addToCart = (product: Product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      const newQty = existingItem ? existingItem.quantity + 1 : 1;
      upsertSupabaseItem(product.id, newQty);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    deleteSupabaseItem(productId);
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    upsertSupabaseItem(productId, quantity);
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    clearSupabaseCart();
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        hasCheckedCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};