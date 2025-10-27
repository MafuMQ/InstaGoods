import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import Header from "@/components/customer/Header";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, getCartCount, clearCart } = useCart();

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
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Link to="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
              <Button className="flex-1" onClick={clearCart} variant="destructive">Clear Cart</Button>
              <Button className="flex-1">Checkout</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;