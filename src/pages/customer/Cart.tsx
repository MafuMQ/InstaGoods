import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useCart } from "@/context/CartContext";
import Header from "@/components/customer/Header";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, getCartCount, clearCart } = useCart();
  const navigate = useNavigate();
  const [isCustomer, setIsCustomer] = useState<boolean | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

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
      navigate("/customer-auth");
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container px-4 sm:px-6 py-6 sm:py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Your Cart</h1>
            <div className="text-center py-12">
              <p className="text-lg mb-4">Your cart is empty</p>
              <Link to="/">
                <Button>Continue Shopping</Button>
              </Link>
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
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Your Cart ({getCartCount()})</h1>
          
          <div className="space-y-4 sm:space-y-6">
            {cartItems.map((item) => (
              <Card key={item.id} className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-base sm:text-lg">{item.name}</h3>
                    <p className="text-muted-foreground">R{item.price}</p>
                    
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                  
                  <div className="font-semibold text-lg sm:text-base sm:ml-auto">
                    R{item.price * item.quantity}
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-card rounded-lg border">
            <div className="flex justify-between items-center mb-4">
              <span className="text-base sm:text-lg font-semibold">Total:</span>
              <span className="text-xl sm:text-2xl font-bold">R{getCartTotal()}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center justify-center">
              <Link to="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className="flex-1"
                    variant="destructive"
                  >
                    Clear Cart
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Cart</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to clear your cart?
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
                className="flex-1"
                onClick={handleCheckout}
                disabled={loadingAuth}
              >
                {loadingAuth ? "Checking auth..." : "Checkout"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;