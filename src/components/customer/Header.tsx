import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useOnlyAvailable } from "@/context/OnlyAvailableContext";
import { Search, ShoppingBag, Heart, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LocationPicker from "@/components/ui/LocationPicker";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

const Header = () => {
  const { getCartCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const cartCount = getCartCount();
  const wishlistCount = getWishlistCount();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { onlyAvailable, setOnlyAvailable } = useOnlyAvailable();

  // Expose this state globally if needed, or lift to context if filtering is done outside Header

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            InstaGoods
          </span>
        </Link>
        
        <div className="hidden md:flex flex-1 max-w-2xl mx-8 gap-4 items-center">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search for unique items..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
            />
          </div>
          <div className="w-56 flex items-center gap-2">
            <LocationPicker />
            <Button
              variant={onlyAvailable ? "default" : "outline"}
              size="sm"
              className="ml-2 whitespace-nowrap"
              onClick={() => setOnlyAvailable(!onlyAvailable)}
            >
              {onlyAvailable ? "Showing Available" : "Only Available"}
            </Button>
          </div>
        </div>
        
        <nav className="flex items-center space-x-2">
          <Link to="/auth">
            <Button variant="ghost" size="sm">
              <Store className="h-4 w-4 mr-2" />
              Supplier Portal
            </Button>
          </Link>
          <Link to="/wishlist">
            <Button variant="ghost" size="icon" className="relative">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Button>
          </Link>
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
