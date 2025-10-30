import { useParams, Link } from "react-router-dom";
import { Star, Heart, ShoppingBag, Store } from "lucide-react";
import Header from "@/components/customer/Header";
import { Loading } from "@/components/ui/loading-spinner";
import { useProduct } from "@/hooks/useProduct";
import { useLocation } from "@/context/LocationContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { haversineDistance } from "@/lib/distance";

const ProductDetail = () => {
  const { id } = useParams();
  const { product, loading, error } = useProduct(id);
  const supplier = product?.supplier || null;

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { address: userAddress } = useLocation();

  // Helper: check if product is available everywhere
  const isAvailableEverywhere = product?.available_everywhere;
  
  // Helper: check if product is in user's delivery range (simplified for now)
  const isInDeliveryRange = userAddress && product?.delivery_location && 
    userAddress.toLowerCase().includes(product.delivery_location.toLowerCase());

  const canAddToCart = !product?.no_delivery && (isAvailableEverywhere || isInDeliveryRange);

  const handleAddToCart = () => {
    if (product && canAddToCart) {
      // Convert product to expected cart format
      const cartProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image_url || '',
        supplierId: product.supplier_id,
        mainCategory: product.main_category,
        subCategory: product.sub_category || '',
        description: product.description || '',
        rating: 4.5, // Default rating since not in database
        reviews: 10, // Default reviews since not in database
        no_delivery: product.no_delivery || false,
        delivery_fee: product.delivery_fee || 0,
        availableEverywhere: product.available_everywhere || false,
        deliveryRadiusKm: product.delivery_radius_km || 0,
        region: product.delivery_location || '',
        location: product.delivery_lat && product.delivery_lng ? {
          lat: product.delivery_lat,
          lng: product.delivery_lng
        } : undefined
      };
      addToCart(cartProduct);
    }
  };

  const handleToggleWishlist = () => {
    if (product) {
      if (isInWishlist(product.id)) {
        removeFromWishlist(product.id);
      } else {
        // Convert product to expected wishlist format
        const wishlistProduct = {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image_url || '',
          supplierId: product.supplier_id,
          mainCategory: product.main_category,
          subCategory: product.sub_category || '',
          description: product.description || '',
          rating: 4.5, // Default rating since not in database
          reviews: 10, // Default reviews since not in database
          no_delivery: product.no_delivery || false,
          delivery_fee: product.delivery_fee || 0,
          availableEverywhere: product.available_everywhere || false,
          deliveryRadiusKm: product.delivery_radius_km || 0,
          region: product.delivery_location || '',
          location: product.delivery_lat && product.delivery_lng ? {
            lat: product.delivery_lat,
            lng: product.delivery_lng
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
          <Loading />
        </div>
      </div>
    );
  }

  if (error || !product || !supplier) {
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
      <div className="container px-4 sm:px-6 py-4 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Product Image */}
          <div className="aspect-square overflow-hidden rounded-lg bg-muted">
            <img
              src={product.image_url || '/placeholder-product.jpg'}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-accent text-accent" />
                <span className="font-medium">4.5</span>
              </div>
              <span className="text-muted-foreground">
                (15 reviews)
              </span>
            </div>

            <p className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-6">
              R{product.price}
            </p>

            <p className="text-muted-foreground mb-4 leading-relaxed">
              {product.description}
            </p>

            {/* Delivery/Availability Info */}
            <div className="mb-4">
              {product.no_delivery ? (
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
                    {product.delivery_radius_km && (
                      <span> (within {product.delivery_radius_km} km)</span>
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
            {product.delivery_fee && !product.no_delivery && (
              <div className="mb-2 text-sm text-muted-foreground">
                Delivery Fee: <span className="font-semibold">R{product.delivery_fee}</span>
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
                className={isInWishlist(product?.id || '') ? 'text-red-500 border-red-300' : ''}
              >
                <Heart className={`h-5 w-5 ${isInWishlist(product?.id || '') ? 'fill-current' : ''}`} />
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

export default ProductDetail;
