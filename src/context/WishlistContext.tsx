import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Product, Service, Grocery, Freelance } from "@/lib/data";

type WishlistItem = Product | Service | Grocery | Freelance;

interface WishlistContextType {
  wishlistItemIds: string[];
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

  // Persist to localStorage only when IDs change
  const persistWishlist = useCallback((ids: string[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("wishlist", JSON.stringify(ids));
    }
  }, []);

  const addToWishlist = useCallback((item: WishlistItem) => {
    setWishlistItemIds((prevIds) => {
      if (!prevIds.includes(item.id)) {
        const newIds = [...prevIds, item.id];
        persistWishlist(newIds);
        return newIds;
      }
      return prevIds;
    });
  }, [persistWishlist]);

  const removeFromWishlist = useCallback((itemId: string) => {
    setWishlistItemIds((prevIds) => {
      const newIds = prevIds.filter((id) => id !== itemId);
      persistWishlist(newIds);
      return newIds;
    });
  }, [persistWishlist]);

  const isInWishlist = useCallback((itemId: string) => {
    return wishlistItemIds.includes(itemId);
  }, [wishlistItemIds]);

  const getWishlistCount = useCallback(() => {
    return wishlistItemIds.length;
  }, [wishlistItemIds]);

  return (
    <WishlistContext.Provider
      value={{
        wishlistItemIds,
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