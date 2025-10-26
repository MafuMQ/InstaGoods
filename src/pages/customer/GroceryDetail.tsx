import { useParams, Link } from "react-router-dom";
import { Star, Heart, ShoppingBag, Store } from "lucide-react";
import Header from "@/components/customer/Header";
import { groceries, suppliers } from "@/lib/data";
import { useLocation } from "@/context/LocationContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

const GroceryDetail = () => {
  const { id } = useParams();
  const grocery = groceries.find((p) => p.id === id);
  const supplier = grocery ? suppliers.find((s) => s.id === grocery.supplierId) : null;

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { address: userAddress } = useLocation();

  // Helper: check if grocery is available everywhere
  const isAvailableEverywhere = grocery?.availableEverywhere;
  // Helper: check if grocery is in user's selected region (simple string match)
  const isInRegion = userAddress && grocery?.region && userAddress.toLowerCase().includes(grocery.region.toLowerCase());
  // Helper: show delivery radius if not everywhere
  const deliveryRadius = grocery?.deliveryRadiusKm;

  const canAddToCart = isAvailableEverywhere || isInRegion;

  const handleAddToCart = () => {
    if (grocery && canAddToCart) {
      addToCart(grocery);
    }
  };

  const handleToggleWishlist = () => {
    if (grocery) {
      if (isInWishlist(grocery.id)) {
        removeFromWishlist(grocery.id);
      } else {
        addToWishlist(grocery);
      }
    }
  };

  if (!grocery || !supplier) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Link to="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/*Grocery Image */}
          <div className="aspect-square overflow-hidden rounded-lg bg-muted">
            <img
              src={grocery.image}
              alt={grocery.name}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Grocery Info */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold mb-2">{grocery.name}</h1>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-accent text-accent" />
                <span className="font-medium">{grocery.rating}</span>
              </div>
              <span className="text-muted-foreground">
                ({grocery.reviews} reviews)
              </span>
            </div>

            <p className="text-3xl font-bold text-primary mb-6">
              R{grocery.price}
            </p>

            <p className="text-muted-foreground mb-4 leading-relaxed">
              {grocery.description}
            </p>

            {/* Delivery/Availability Info */}
            <div className="mb-4">
              {isAvailableEverywhere ? (
                <span className="inline-block px-3 py-1 rounded bg-green-100 text-green-800 text-xs font-medium">
                  Delivers everywhere
                </span>
              ) : userAddress ? (
                isInRegion ? (
                  <span className="inline-block px-3 py-1 rounded bg-green-100 text-green-800 text-xs font-medium">
                    Available at <span className="font-semibold">{userAddress}</span>
                    {deliveryRadius && (
                      <span> (within {deliveryRadius} km)</span>
                    )}
                  </span>
                ) : (
                  <span className="inline-block px-3 py-1 rounded bg-red-100 text-red-800 text-xs font-medium">
                    Not available in your location
                  </span>
                )
              ) : (
                <span className="inline-block px-3 py-1 rounded bg-yellow-100 text-yellow-800 text-xs font-medium">
                  Set your region to check availability
                </span>
              )}
            </div>

            <div className="flex gap-3 mb-8">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                title={!canAddToCart ? 'Not available in your location' : ''}
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleToggleWishlist}
                className={isInWishlist(grocery?.id || '') ? 'text-red-500 border-red-300' : ''}
              >
                <Heart className={`h-5 w-5 ${isInWishlist(grocery?.id || '') ? 'fill-current' : ''}`} />
              </Button>
            </div>

            {/* Supplier Card */}
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold text-xl">
                  {supplier.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{supplier.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {supplier.location}
                  </p>
                  <div className="flex items-center gap-4 text-sm mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-accent text-accent" />
                      <span className="font-medium">{supplier.rating}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {supplier.totalSales} sales
                    </span>
                  </div>
                  <Link to={`/supplier/${supplier.id}`}>
                    <Button variant="outline" size="sm">
                      <Store className="mr-2 h-4 w-4" />
                      Visit Shop
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroceryDetail;
