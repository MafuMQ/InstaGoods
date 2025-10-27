import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import Header from "@/components/customer/Header";


const Wishlist = () => {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddAllToCart = () => {
    wishlistItems.forEach((item) => {
      // Only add items that have price (i.e., are products/services/groceries/freelance)
      if (typeof item.price === "number") {
        addToCart(item);
      }
    });
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Your Wishlist</h1>
            <div className="text-center py-12">
              <p className="text-lg mb-4">Your wishlist is empty</p>
              <Link to="/">
                <Button>Start Shopping</Button>
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
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Your Wishlist ({wishlistItems.length})</h1>
          
          <div className="space-y-6">
            {wishlistItems.map((item) => (
              <Card key={item.id} className="p-6">
                <div className="flex items-center gap-6">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-muted-foreground">R{item.price}</p>
                    
                    <div className="flex items-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFromWishlist(item.id)}
                      >
                        Remove from Wishlist
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="mt-8 flex gap-4">
            <Link to="/" className="flex-1">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
            <Button className="flex-1" onClick={handleAddAllToCart}>Add All to Cart</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;