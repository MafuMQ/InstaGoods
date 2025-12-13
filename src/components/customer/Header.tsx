import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDeliveryAndAvailable } from "@/context/OnlyAvailableContext";
import { Search, ShoppingBag, Heart, Store, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { onlyAvailable, setOnlyAvailable, deliveryOnly, setDeliveryOnly } = useDeliveryAndAvailable();

  // Expose this state globally if needed, or lift to context if filtering is done outside Header

  return (
  <header className="sticky top-0 z-30 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <div className="flex flex-col gap-6 mt-8">
                {/* Mobile Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && searchQuery.trim()) {
                        navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
                        setMobileMenuOpen(false);
                      }
                    }}
                  />
                </div>

                {/* Location Picker */}
                <LocationPicker />

                {/* Filter Buttons */}
                <div className="flex flex-col gap-2">
                  <Button
                    variant={onlyAvailable ? "default" : "outline"}
                    size="sm"
                    onClick={() => setOnlyAvailable(!onlyAvailable)}
                  >
                    {onlyAvailable ? "Showing Reachable Only" : "Show All Items"}
                  </Button>
                  <Button
                    variant={deliveryOnly ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDeliveryOnly(!deliveryOnly)}
                  >
                    {deliveryOnly ? "Delivery Only" : "All Delivery Types"}
                  </Button>
                </div>

                {/* Navigation Links */}
                <div className="flex flex-col gap-2 pt-4 border-t">
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Store className="h-4 w-4 mr-2" />
                      Supplier Portal
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              InstaGoods
            </span>
          </Link>
        </div>
        
        {/* Desktop Search and Filters */}
        <div className="hidden lg:flex flex-1 max-w-2xl mx-8 gap-4 items-center">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search for items..."
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
          <div className="flex items-center gap-2">
            <LocationPicker />
            <Button
              variant={onlyAvailable ? "default" : "outline"}
              size="sm"
              className="whitespace-nowrap text-xs"
              onClick={() => setOnlyAvailable(!onlyAvailable)}
            >
              {onlyAvailable ? "Reachable" : "Show All"}
            </Button>
            <Button
              variant={deliveryOnly ? "default" : "outline"}
              size="sm"
              className="whitespace-nowrap text-xs"
              onClick={() => setDeliveryOnly(!deliveryOnly)}
            >
              {deliveryOnly ? "Delivery" : "All Types"}
            </Button>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
          <Link to="/auth">
            <Button variant="ghost" size="sm">
              <Store className="h-4 w-4 mr-2" />
              <span className="hidden lg:inline">Supplier Portal</span>
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

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setMobileMenuOpen(true)}
          >
            <Search className="h-5 w-5" />
          </Button>
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
        </div>
      </div>
    </header>
  );
};

export default Header;
