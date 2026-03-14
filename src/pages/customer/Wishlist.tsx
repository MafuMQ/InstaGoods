import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";
import { Heart, Trash2, ShoppingBag, Plus, ArrowRight, Sparkles, Smartphone } from "lucide-react";
import { toast } from "sonner";

const Wishlist = () => {
  const { wishlistItems, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [addingItems, setAddingItems] = useState<string[]>([]);
  const [removingItem, setRemovingItem] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 overflow-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Your Wishlist</h1>
            <div className="flex items-center justify-center py-8 sm:py-10">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleAddToCart = async (item: any) => {
    setAddingItems(prev => [...prev, item.id]);
    await new Promise(resolve => setTimeout(resolve, 300));
    addToCart(item);
    toast.success(`${item.name} added to cart!`);
    setAddingItems(prev => prev.filter(id => id !== item.id));
  };

  const handleAddAllToCart = async () => {
    const itemsWithPrice = wishlistItems.filter(item => typeof item.price === "number");
    
    for (const item of itemsWithPrice) {
      setAddingItems(prev => [...prev, item.id]);
      await new Promise(resolve => setTimeout(resolve, 200));
      addToCart(item);
    }
    
    toast.success(`${itemsWithPrice.length} items added to cart!`);
    setAddingItems([]);
  };

  const handleRemoveItem = async (itemId: string) => {
    setRemovingItem(itemId);
    await new Promise(resolve => setTimeout(resolve, 200));
    removeFromWishlist(itemId);
    setRemovingItem(null);
    toast.info("Removed from wishlist");
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 overflow-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Your Wishlist</h1>
            
            {/* Enhanced Empty State */}
            <div className="text-center py-6 sm:py-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="mx-auto w-16 h-16 sm:w-24 sm:h-24 mb-3 sm:mb-6 rounded-full bg-muted/50 flex items-center justify-center">
                <Heart className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold mb-2">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-3 sm:mb-4 max-w-sm mx-auto text-xs sm:text-sm">
                Save your favorite items here! Browse products and click the heart icon to add them to your wishlist.
              </p>
              <Link to="/">
                <Button size="lg" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Start Shopping
                </Button>
              </Link>
              
              {/* Suggestions */}
              <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-left">
                <div className="p-2 sm:p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="h-4 w-4 text-red-500" />
                    <h3 className="font-medium text-sm">Save Favorites</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">Click the heart on any product</p>
                </div>
                <div className="p-2 sm:p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 mb-1">
                    <ShoppingBag className="h-4 w-4 text-primary" />
                    <h3 className="font-medium text-sm">Move to Cart</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">Add saved items to your cart</p>
                </div>
                <div className="p-2 sm:p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Smartphone className="h-4 w-4 text-blue-500" />
                    <h3 className="font-medium text-sm">Access Anywhere</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">Your wishlist syncs automatically</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1 overflow-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Your Wishlist</h1>
              <p className="text-muted-foreground mt-0.5 text-sm">{wishlistItems.length} saved item{wishlistItems.length !== 1 ? 's' : ''}</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleAddAllToCart}
              disabled={addingItems.length > 0}
              className="gap-2"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Add All to Cart</span>
            </Button>
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            {wishlistItems.map((item, index) => (
              <Card 
                key={item.id} 
                className={`p-3 sm:p-4 transition-all duration-300 ${
                  removingItem === item.id ? 'opacity-0 scale-95' : 'animate-in fade-in slide-in-from-bottom-2'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                  {/* Product Image */}
                  <Link to={`/product/${item.id}`} className="shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md hover:opacity-80 transition-opacity"
                    />
                  </Link>
                  
                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.id}`}>
                      <h3 className="font-semibold text-sm sm:text-base hover:text-primary transition-colors truncate">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-muted-foreground mt-0.5 text-sm">R{item.price}</p>
                    
                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-3">
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(item)}
                        disabled={addingItems.includes(item.id)}
                        className="gap-2"
                      >
                        {addingItems.includes(item.id) ? (
                          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                        Add to Cart
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                  
                  {/* Price */}
                  <div className="flex sm:flex-col items-center justify-between sm:justify-end gap-2 mt-4 sm:mt-0 sm:ml-auto">
                    <span className="font-bold text-lg">R{item.price}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {/* Actions Footer */}
          <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-card rounded-lg border shadow-sm">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Link to="/" className="flex-1">
                <Button variant="outline" className="w-full gap-2">
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  Continue Shopping
                </Button>
              </Link>
              <Button 
                className="flex-1 gap-2" 
                onClick={handleAddAllToCart}
                disabled={addingItems.length > 0}
              >
                <ShoppingBag className="h-4 w-4" />
                {addingItems.length > 0 ? "Adding..." : `Add All to Cart (${wishlistItems.length})`}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Wishlist;
