import { Link } from "react-router-dom";
import { Heart, Star } from "lucide-react";
import { Product, suppliers } from "@/lib/data";
import { MarketplaceProduct } from "@/hooks/useMarketplaceProducts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useLocation } from "@/context/LocationContext";

interface ProductCardProps {
  product: Product | MarketplaceProduct;
}

const ProductCard = ({ product }: ProductCardProps) => {
  // Check if it's a marketplace product (from database) or static product
  const isMarketplaceProduct = 'supplier_id' in product;
  
  const productImage = isMarketplaceProduct 
    ? (product as MarketplaceProduct).image_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&auto=format&fit=crop"
    : (product as Product).image;

  const productRating = isMarketplaceProduct ? 4.5 : (product as Product).rating;
  const productReviews = isMarketplaceProduct ? 0 : (product as Product).reviews;
  

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { address: userAddress } = useLocation();

  // Location-based availability logic (only for static products)
  let canAddToCart = true;
  if (!isMarketplaceProduct) {
    const p = product as Product;
    if (p.no_delivery) {
      canAddToCart = false;
    } else {
      const isAvailableEverywhere = p.availableEverywhere;
      const isInRegion = userAddress && p.region && userAddress.toLowerCase().includes(p.region.toLowerCase());
      canAddToCart = isAvailableEverywhere || isInRegion;
    }
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!canAddToCart) return;
    // Convert MarketplaceProduct to Product format if needed
    if (isMarketplaceProduct) {
      const marketplaceProduct = product as MarketplaceProduct;
      const productForCart: Product = {
        id: marketplaceProduct.id,
        name: marketplaceProduct.name,
        price: marketplaceProduct.price,
        image: marketplaceProduct.image_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&auto=format&fit=crop",
        mainCategory: marketplaceProduct.main_category,
        subCategory: marketplaceProduct.sub_category || "",
        rating: 4.5,
        reviews: 0,
        supplierId: marketplaceProduct.supplier_id,
        description: marketplaceProduct.description || ""
      };
      addToCart(productForCart);
    } else {
      addToCart(product as Product);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Convert MarketplaceProduct to Product format if needed for wishlist
    let itemForWishlist: Product;
    if (isMarketplaceProduct) {
      const marketplaceProduct = product as MarketplaceProduct;
      itemForWishlist = {
        id: marketplaceProduct.id,
        name: marketplaceProduct.name,
        price: marketplaceProduct.price,
        image: marketplaceProduct.image_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&auto=format&fit=crop",
        mainCategory: marketplaceProduct.main_category,
        subCategory: marketplaceProduct.sub_category || "",
        rating: 4.5,
        reviews: 0,
        supplierId: marketplaceProduct.supplier_id,
        description: marketplaceProduct.description || ""
      };
    } else {
      itemForWishlist = product as Product;
    }
    
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(itemForWishlist);
    }
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-hover)]">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={productImage}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <Button
            variant="ghost"
            size="icon"
            className={`absolute right-2 top-2 bg-card/80 backdrop-blur hover:bg-card ${
              isInWishlist(product.id) ? 'text-red-500' : ''
            }`}
            onClick={handleToggleWishlist}
          >
            <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
          </Button>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-base mb-1 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
            {isMarketplaceProduct ? "Artisan Seller" : "Local Artisan"}
          </p>
          <div className="flex items-center gap-1 mb-3">
            <Star className="h-3 w-3 fill-accent text-accent" />
            <span className="text-sm font-medium">{productRating}</span>
            <span className="text-sm text-muted-foreground">
              ({productReviews})
            </span>
          </div>
          <div className="flex flex-col gap-1 mb-2">
            {isMarketplaceProduct ? (
              <span className="text-xs text-muted-foreground">Region: N/A</span>
            ) : (
              <>
                <span className="text-xs text-muted-foreground">
                  {(product as Product).availableEverywhere ? "Available everywhere" : `Region: ${(product as Product).region || 'N/A'}`}
                </span>
                {!(product as Product).availableEverywhere && (product as Product).deliveryRadiusKm && (
                  <span className="text-xs text-muted-foreground">
                    Delivery radius: {(product as Product).deliveryRadiusKm} km
                  </span>
                )}
              </>
            )}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-primary">R{product.price}</p>
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={!canAddToCart}
              title={!canAddToCart ? 'Not available in your location' : ''}
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </Link>
    </Card>
  );
};

export default ProductCard;
