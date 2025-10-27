import { useParams, Link } from "react-router-dom";
import { Star, Heart, ShoppingBag, Store } from "lucide-react";
import Header from "@/components/customer/Header";
import { useProduct } from "@/hooks/useProduct";
import { useLocation } from "@/context/LocationContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

const GroceryDetail = () => {
  const { id } = useParams();
  const { product: grocery, loading, error } = useProduct(id);
  const supplier = grocery?.supplier || null;

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { address: userAddress } = useLocation();

  // Helper: check if grocery is available everywhere
  const isAvailableEverywhere = grocery?.available_everywhere;
  // Helper: check if grocery is in user's delivery range (simplified for now)
  const isInDeliveryRange = userAddress && grocery?.delivery_location && 
    userAddress.toLowerCase().includes(grocery.delivery_location.toLowerCase());

  const canAddToCart = !grocery?.no_delivery && (isAvailableEverywhere || isInDeliveryRange);

  const handleAddToCart = () => {
    if (grocery && canAddToCart) {
      // Convert product to expected cart format
      const cartProduct = {
        id: grocery.id,
        name: grocery.name,
        price: grocery.price,
        image: grocery.image_url || '',
        supplierId: grocery.supplier_id,
        mainCategory: grocery.main_category,
        subCategory: grocery.sub_category || '',
        description: grocery.description || '',
        rating: 4.5, // Default rating since not in database
        reviews: 10, // Default reviews since not in database
        no_delivery: grocery.no_delivery || false,
        delivery_fee: grocery.delivery_fee || 0,
        availableEverywhere: grocery.available_everywhere || false,
        deliveryRadiusKm: grocery.delivery_radius_km || 0,
        region: grocery.delivery_location || '',
        location: grocery.delivery_lat && grocery.delivery_lng ? {
          lat: grocery.delivery_lat,
          lng: grocery.delivery_lng
        } : undefined
      };
      addToCart(cartProduct);
    }
  };

  const handleToggleWishlist = () => {
    if (grocery) {
      if (isInWishlist(grocery.id)) {
        removeFromWishlist(grocery.id);
      } else {
        // Convert product to expected wishlist format
        const wishlistProduct = {
          id: grocery.id,
          name: grocery.name,
          price: grocery.price,
          image: grocery.image_url || '',
          supplierId: grocery.supplier_id,
          mainCategory: grocery.main_category,
          subCategory: grocery.sub_category || '',
          description: grocery.description || '',
          rating: 4.5, // Default rating since not in database
          reviews: 10, // Default reviews since not in database
          no_delivery: grocery.no_delivery || false,
          delivery_fee: grocery.delivery_fee || 0,
          availableEverywhere: grocery.available_everywhere || false,
          deliveryRadiusKm: grocery.delivery_radius_km || 0,
          region: grocery.delivery_location || '',
          location: grocery.delivery_lat && grocery.delivery_lng ? {
            lat: grocery.delivery_lat,
            lng: grocery.delivery_lng
          } : undefined
        };
        addToWishlist(wishlistProduct);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  if (error || !grocery || !supplier) {
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
              src={grocery.image_url || '/placeholder-product.jpg'}
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
                <span className="font-medium">4.5</span>
              </div>
              <span className="text-muted-foreground">
                (15 reviews)
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
              {grocery.no_delivery ? (
                <span className="inline-block px-3 py-1 rounded bg-orange-100 text-orange-800 text-xs font-medium">
                  No delivery available (collection only)
                </span>
              ) : isAvailableEverywhere ? (
                <span className="inline-block px-3 py-1 rounded bg-green-100 text-green-800 text-xs font-medium">
                  Delivers everywhere
                </span>
              ) : userAddress ? (
                isInDeliveryRange ? (
                  <span className="inline-block px-3 py-1 rounded bg-green-100 text-green-800 text-xs font-medium">
                    Available at <span className="font-semibold">{userAddress}</span>
                    {grocery.delivery_radius_km && (
                      <span> (within {grocery.delivery_radius_km} km)</span>
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
            {grocery.delivery_fee && !grocery.no_delivery && (
              <div className="mb-2 text-sm text-muted-foreground">
                Delivery Fee: <span className="font-semibold">R{grocery.delivery_fee}</span>
              </div>
            )}

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
                  {supplier.business_name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{supplier.business_name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {supplier.location}
                  </p>
                  <div className="flex items-center gap-4 text-sm mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-accent text-accent" />
                      <span className="font-medium">4.5</span>
                    </div>
                    <span className="text-muted-foreground">
                      15+ sales
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
