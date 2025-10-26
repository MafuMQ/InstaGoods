import { createContext, useContext, useState, ReactNode } from "react";
import { Product, Service, Grocery, Freelance } from "@/lib/data";

type WishlistItem = Product | Service | Grocery | Freelance;

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (itemId: string) => void;
  isInWishlist: (itemId: string) => boolean;
  getWishlistCount: () => number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(() => {
    const savedWishlist = localStorage.getItem("wishlist");
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });

  const addToWishlist = (item: WishlistItem) => {
    setWishlistItems((prevItems) => {
      if (!prevItems.find((i) => i.id === item.id)) {
        const newItems = [...prevItems, item];
        localStorage.setItem("wishlist", JSON.stringify(newItems));
        return newItems;
      }
      return prevItems;
    });
  };

  const removeFromWishlist = (itemId: string) => {
    setWishlistItems((prevItems) => {
      const newItems = prevItems.filter((item) => item.id !== itemId);
      localStorage.setItem("wishlist", JSON.stringify(newItems));
      return newItems;
    });
  };

  const isInWishlist = (itemId: string) => {
    return wishlistItems.some((item) => item.id === itemId);
  };

  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
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