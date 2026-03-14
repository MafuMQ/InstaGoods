import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from "react";
import { Product, Service, Grocery, Freelance, products, services, groceries, freelance } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type WishlistItem = Product | Service | Grocery | Freelance;

interface WishlistContextType {
  wishlistItemIds: string[];
  wishlistItems: WishlistItem[];
  loading: boolean;
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (itemId: string) => void;
  isInWishlist: (itemId: string) => boolean;
  getWishlistCount: () => number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlistItemIds, setWishlistItemIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    const savedWishlist = localStorage.getItem("wishlist");
    try {
      return savedWishlist ? JSON.parse(savedWishlist) : [];
    } catch {
      return [];
    }
  });

  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const userIdRef = useRef<string | null>(null);
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  // Persist to localStorage only when IDs change
  const persistWishlist = useCallback((ids: string[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("wishlist", JSON.stringify(ids));
    }
  }, []);

  // Auth listener — merge with Supabase wishlist when the user logs in
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** On login: load Supabase wishlist IDs, merge with localStorage IDs. */
  const mergeWithSupabase = async (uid: string) => {
    const { data, error } = await supabase
      .from("customer_wishlists")
      .select("product_id")
      .eq("user_id", uid);

    if (error || !data) return;

    const remoteIds = data.map((row) => row.product_id);
    const localIds: string[] =
      typeof window !== "undefined"
        ? (() => {
            try {
              return JSON.parse(localStorage.getItem("wishlist") ?? "[]");
            } catch {
              return [];
            }
          })()
        : [];

    // Upsert any local-only IDs to Supabase
    const localOnlyIds = localIds.filter((id) => !remoteIds.includes(id));
    // Only UUID products can be persisted (static IDs don't exist in the products table)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const toInsert = localOnlyIds
      .filter((id) => uuidRegex.test(id))
      .map((id) => ({ user_id: uid, product_id: id }));

    if (toInsert.length > 0) {
      await supabase.from("customer_wishlists").upsert(toInsert);
    }

    // Merged set: remote (DB) IDs + any local static IDs
    const staticLocalIds = localIds.filter((id) => !uuidRegex.test(id));
    const merged = [...new Set([...remoteIds, ...staticLocalIds])];
    persistWishlist(merged);
    setWishlistItemIds(merged);
  };

  const addToWishlist = useCallback((item: WishlistItem) => {
    setWishlistItemIds((prevIds) => {
      if (!prevIds.includes(item.id)) {
        const newIds = [...prevIds, item.id];
        persistWishlist(newIds);
        // Persist to Supabase if logged in (only real DB products have UUIDs)
        const uid = userIdRef.current;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uid && uuidRegex.test(item.id)) {
          supabase
            .from("customer_wishlists")
            .upsert({ user_id: uid, product_id: item.id })
            .then(() => {});
        }
        return newIds;
      }
      return prevIds;
    });
  }, [persistWishlist]);

  const removeFromWishlist = useCallback((itemId: string) => {
    setWishlistItemIds((prevIds) => {
      const newIds = prevIds.filter((id) => id !== itemId);
      persistWishlist(newIds);
      // Remove from Supabase if logged in
      const uid = userIdRef.current;
      if (uid) {
        supabase
          .from("customer_wishlists")
          .delete()
          .eq("user_id", uid)
          .eq("product_id", itemId)
          .then(() => {});
      }
      return newIds;
    });
  }, [persistWishlist]);

  const isInWishlist = useCallback((itemId: string) => {
    return wishlistItemIds.includes(itemId);
  }, [wishlistItemIds]);

  const getWishlistCount = useCallback(() => {
    return wishlistItemIds.length;
  }, [wishlistItemIds]);

  // Fetch wishlist items when IDs change
  useEffect(() => {
    const fetchWishlistItems = async () => {
      setLoading(true);
      try {
        // UUID regex to distinguish between database and static IDs
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        
        const dbIds = wishlistItemIds.filter(id => uuidRegex.test(id));
        const staticIds = wishlistItemIds.filter(id => !uuidRegex.test(id));
        
        const items: WishlistItem[] = [];
        
        // Fetch from static data first
        const allStaticItems = [...products, ...services, ...groceries, ...freelance];
        for (const id of staticIds) {
          const item = allStaticItems.find(item => item.id === id);
          if (item) {
            items.push(item);
          }
        }
        
        // Fetch from database if there are UUIDs (only active products)
        if (dbIds.length > 0) {
          const { data: dbProducts, error } = await supabase
            .from('products')
            .select('*')
            .in('id', dbIds)
            .eq('is_active', true);
          
          if (!error && dbProducts) {
            for (const dbProduct of dbProducts) {
              items.push({
                id: dbProduct.id,
                name: dbProduct.name,
                description: dbProduct.description,
                price: dbProduct.price,
                image: dbProduct.image_url,
                mainCategory: dbProduct.main_category,
                subCategory: dbProduct.sub_category,
                supplierId: dbProduct.supplier_id,
                rating: 0,
                reviews: 0,
                region: dbProduct.delivery_location || undefined,
                location: dbProduct.delivery_lat && dbProduct.delivery_lng 
                  ? { lat: dbProduct.delivery_lat, lng: dbProduct.delivery_lng } 
                  : undefined,
                deliveryRadiusKm: dbProduct.delivery_radius_km || undefined,
                availableEverywhere: dbProduct.available_everywhere || false,
              });
            }

            // Prune stale IDs (deleted or deactivated products) from state,
            // localStorage, and Supabase so counts and badges stay accurate
            const foundIds = new Set(dbProducts.map((p) => p.id));
            const staleIds = dbIds.filter((id) => !foundIds.has(id));
            if (staleIds.length > 0) {
              const pruned = wishlistItemIds.filter((id) => !staleIds.includes(id));
              persistWishlist(pruned);
              setWishlistItemIds(pruned);
              const uid = userIdRef.current;
              if (uid) {
                supabase
                  .from('customer_wishlists')
                  .delete()
                  .eq('user_id', uid)
                  .in('product_id', staleIds)
                  .then(() => {});
              }
            }
          }
        }
        
        // Sort items to match the order of wishlistItemIds
        const sortedItems = wishlistItemIds
          .map(id => items.find(item => item.id === id))
          .filter((item): item is WishlistItem => item !== undefined);
        
        setWishlistItems(sortedItems);
      } catch (error) {
        setWishlistItems([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWishlistItems();
  }, [wishlistItemIds]);

  return (
    <WishlistContext.Provider
      value={{
        wishlistItemIds,
        wishlistItems,
        loading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        getWishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
