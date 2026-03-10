import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useCart } from "@/context/CartContext";
import Header from "@/components/customer/Header";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { ShoppingBag, Trash2, Minus, Plus, ArrowRight, Sparkles, Heart, Truck } from "lucide-react";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, getCartCount, clearCart } = useCart();
  const navigate = useNavigate();
  const [isCustomer, setIsCustomer] = useState<boolean | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [removingItem, setRemovingItem] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Check if user has customer role
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (error) {
          console.error("Error checking customer role:", error);
          setIsCustomer(false);
        } else {
          setIsCustomer(data?.role === "customer");
        }
      } else {
        setIsCustomer(false);
      }

      setLoadingAuth(false);
    };

    checkAuthStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .maybeSingle()
          .then(({ data, error }) => {
            if (error) {
              console.error("Error checking customer role:", error);
              setIsCustomer(false);
            } else {
              setIsCustomer(data?.role === "customer");
            }
          });
      } else {
        setIsCustomer(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleCheckout = () => {
    // Store cart items in localStorage for checkout process
    const cartData = cartItems.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      supplierId: item.supplierId || 'unknown'
    }));
    localStorage.setItem('checkout_cart', JSON.stringify(cartData));
    
    if (isCustomer) {
      navigate("/payment");
    } else {
      // Pass returnToCart=true so that after login, user is redirected back to cart if they have items
      navigate("/customer-auth?returnToCart=true");
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setRemovingItem(itemId);
    // Small delay for animation
    await new Promise(resolve => setTimeout(resolve, 200));
    removeFromCart(itemId);
    setRemovingItem(null);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container px-4 sm:px-6 py-6 sm:py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Your Cart</h1>
            
            {/* Enhanced Empty State */}
            <div className="text-center py-12 sm:py-16 animate-in fade-in zoom-in-95 duration-500">
              <div className="mx-auto w-24 h-24 sm:w-32 sm:h-32 mb-6 rounded-full bg-muted/50 flex items-center justify-center">
                <ShoppingBag className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground" />
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Looks like you haven't added any items yet. Start shopping to fill your cart with amazing products!
              </p>
              <Link to="/">
                <Button size="lg" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Start Shopping
                </Button>
              </Link>
              
              {/* Suggestion cards */}
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Browse Products</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">Explore our curated collection</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    <h3 className="font-medium">Save Favorites</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">Add items to your wishlist</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="h-5 w-5 text-green-600" />
                    <h3 className="font-medium">Fast Delivery</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">Get items delivered to you</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container px-4 sm:px-6 py-6 sm:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Your Cart</h1>
              <p className="text-muted-foreground mt-1">{getCartCount()} item{getCartCount() !== 1 ? 's' : ''} in your cart</p>
            </div>
          </div>
          
          <div className="space-y-4 sm:space-y-6">
            {cartItems.map((item, index) => (
              <Card 
                key={item.id} 
                className={`p-4 sm:p-6 transition-all duration-300 ${
                  removingItem === item.id ? 'opacity-0 scale-95' : 'animate-in fade-in slide-in-from-bottom-2'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                  {/* Product Image */}
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-md"
                    />
                  </div>
                  
                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg truncate">{item.name}</h3>
                    <p className="text-muted-foreground">R{item.price} each</p>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 mt-4">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            if (item.quantity === 1) {
                              handleRemoveItem(item.id);
                            } else {
                              updateQuantity(item.id, item.quantity - 1);
                            }
                          }}
                          aria-label={item.quantity === 1 ? "Remove item" : "Decrease quantity"}
                        >
                          {item.quantity === 1 ? (
                            <Trash2 className="h-4 w-4" />
                          ) : (
                            <Minus className="h-4 w-4" />
                          )}
                        </Button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= 10}
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
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
                  
                  {/* Item Total */}
                  <div className="flex sm:flex-col items-center justify-between sm:justify-end gap-2 mt-4 sm:mt-0 sm:ml-auto">
                    <span className="text-sm text-muted-foreground sm:hidden">Subtotal:</span>
                    <span className="font-bold text-lg">R{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {/* Cart Summary */}
          <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-card rounded-lg border shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>R{getCartTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className="text-green-600">Calculated at checkout</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold text-primary">R{getCartTotal().toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Link to="/" className="flex-1">
                <Button variant="outline" className="w-full gap-2">
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  Continue Shopping
                </Button>
              </Link>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex-1 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Cart
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Cart</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to remove all items from your cart? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        clearCart();
                      }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Clear Cart
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <Button
                className="flex-1 gap-2"
                onClick={handleCheckout}
                disabled={loadingAuth || cartItems.length === 0}
                size="lg"
              >
                {loadingAuth ? (
                  "Checking..."
                ) : (
                  <>
                    Checkout
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
