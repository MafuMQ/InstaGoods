import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useDeliveryAndAvailable } from "@/context/OnlyAvailableContext";
import { Search, ShoppingBag, CircleUserIcon, Heart, Store, Menu, X } from "lucide-react";
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
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { onlyAvailable, setOnlyAvailable, deliveryOnly, setDeliveryOnly } = useDeliveryAndAvailable();

  // Check if current route is active
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-14 md:h-16 items-center justify-between gap-2 md:gap-4 px-3 md:px-4">
        <div className="flex items-center gap-2">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  InstaGoods
                </span>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Mobile Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search for items..."
                  className="pl-10 pr-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
                      setMobileMenuOpen(false);
                    }
                  }}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {/* Location Picker */}
              <div className="mb-4">
                <LocationPicker />
              </div>

              {/* Filter Buttons */}
              <div className="flex flex-col gap-2 mb-4">
                <Button
                  variant={onlyAvailable ? "default" : "outline"}
                  size="sm"
                  onClick={() => setOnlyAvailable(!onlyAvailable)}
                  className="w-full justify-start"
                >
                  {onlyAvailable ? "✓ Showing Reachable Only" : "Show All Items"}
                </Button>
                <Button
                  variant={deliveryOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDeliveryOnly(!deliveryOnly)}
                  className="w-full justify-start"
                >
                  {deliveryOnly ? "✓ Delivery Only" : "All Delivery Types"}
                </Button>
              </div>
                    
              {/* User Links */}
              <div className="flex flex-col gap-2 pt-4 border-t mt-auto">
                <Link to="/customer-auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button 
                    variant={isActive('/customer') ? "secondary" : "ghost"} 
                    className="w-full justify-start"
                  >
                    <CircleUserIcon className="h-4 w-4 mr-2" />
                    Customer Portal
                  </Button>
                </Link>
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button 
                    variant={isActive('/supplier') || isActive('/admin') ? "secondary" : "ghost"} 
                    className="w-full justify-start"
                  >
                    <Store className="h-4 w-4 mr-2" />
                    Supplier Portal
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-lg md:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              InstaGoods 
            </span>
          </Link>
        </div>
        
        {/* Desktop Search and Filters */}
        <div className="hidden lg:flex flex-1 max-w-2xl mx-4 gap-3 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search for items..."
              className="pl-10 pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <LocationPicker />
            <Button
              variant={onlyAvailable ? "default" : "outline"}
              size="sm"
              className="whitespace-nowrap text-xs hidden md:flex"
              onClick={() => setOnlyAvailable(!onlyAvailable)}
            >
              {onlyAvailable ? "✓ Reachable" : "Show All"}
            </Button>
            <Button
              variant={deliveryOnly ? "default" : "outline"}
              size="sm"
              className="whitespace-nowrap text-xs hidden md:flex"
              onClick={() => setDeliveryOnly(!deliveryOnly)}
            >
              {deliveryOnly ? "✓ Delivery" : "All Types"}
            </Button>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link to="/wishlist">
            <Button 
              variant={isActive('/wishlist') ? "secondary" : "ghost"} 
              size="icon" 
              className="relative"
              aria-label={`Wishlist${wishlistCount > 0 ? `, ${wishlistCount} items` : ''}`}
            >
              <Heart className={`h-5 w-5 ${isActive('/wishlist') ? 'fill-current' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </Button>
          </Link>
          <Link to="/cart">
            <Button 
              variant={isActive('/cart') ? "secondary" : "ghost"} 
              size="icon" 
              className="relative"
              aria-label={`Shopping cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Customer Portal Button */}
          <Link to="/customer-auth">
            <Button 
              variant={isActive('/customer') ? "secondary" : "ghost"} 
              size="sm" 
              title="Customer Portal"
              aria-label="Customer Portal"
              className="gap-2"
            >
              <CircleUserIcon className="h-4 w-4" />
              <span className="hidden lg:inline">Customer</span>
            </Button>
          </Link>

          {/* Supplier Portal Button */}
          <Link to="/auth">
            <Button 
              variant={isActive('/supplier') || isActive('/admin') ? "secondary" : "ghost"} 
              size="sm" 
              title="Supplier Portal"
              aria-label="Supplier Portal"
              className="gap-2"
            >
              <Store className="h-4 w-4" />
              <span className="hidden lg:inline">Sell</span>
            </Button>
          </Link>
        </nav>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Button>
          <Link to="/wishlist">
            <Button variant="ghost" size="icon" className="relative">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </Button>
          </Link>
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Mobile Search Bar (collapsible) */}
      {isSearchOpen && (
        <div className="md:hidden border-t p-3 bg-background animate-in slide-in-from-top-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search for items..."
              className="pl-10 pr-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
                  setIsSearchOpen(false);
                }
              }}
              autoFocus
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <div className="flex gap-2 mt-2">
            <Button
              variant={onlyAvailable ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => setOnlyAvailable(!onlyAvailable)}
            >
              {onlyAvailable ? "✓ Reachable" : "Show All"}
            </Button>
            <Button
              variant={deliveryOnly ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => setDeliveryOnly(!deliveryOnly)}
            >
              {deliveryOnly ? "✓ Delivery" : "All Types"}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
