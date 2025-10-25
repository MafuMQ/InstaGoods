import { Link } from "react-router-dom";
import { Heart, Star } from "lucide-react";
import { Product } from "@/lib/data";
import { MarketplaceProduct } from "@/hooks/useMarketplaceProducts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
            className="absolute right-2 top-2 bg-card/80 backdrop-blur hover:bg-card"
            onClick={(e) => e.preventDefault()}
          >
            <Heart className="h-4 w-4" />
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
          <p className="text-lg font-bold text-primary">${product.price}</p>
        </div>
      </Link>
    </Card>
  );
};

export default ProductCard;
