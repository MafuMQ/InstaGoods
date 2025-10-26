import { Link } from "react-router-dom";
import { Heart, Star } from "lucide-react";
import { Freelance, suppliers } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

interface FreelanceCardProps {
  freelance: Freelance;
}

const FreelanceCard = ({ freelance }: FreelanceCardProps) => {
  const supplier = suppliers.find((s) => s.id === freelance.supplierId);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(freelance);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isInWishlist(freelance.id)) {
      removeFromWishlist(freelance.id);
    } else {
      addToWishlist(freelance);
    }
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-hover)]">
      <Link to={`/freelance/${freelance.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={freelance.image}
            alt={freelance.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <Button
            variant="ghost"
            size="icon"
            className={`absolute right-2 top-2 bg-card/80 backdrop-blur hover:bg-card ${
              isInWishlist(freelance.id) ? 'text-red-500' : ''
            }`}
            onClick={handleToggleWishlist}
          >
            <Heart className={`h-4 w-4 ${isInWishlist(freelance.id) ? 'fill-current' : ''}`} />
          </Button>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-base mb-1 line-clamp-1">
            {freelance.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
            {supplier?.name}
          </p>
          <div className="flex items-center gap-1 mb-3">
            <Star className="h-3 w-3 fill-accent text-accent" />
            <span className="text-sm font-medium">{freelance.rating}</span>
            <span className="text-sm text-muted-foreground">
              ({freelance.reviews})
            </span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-primary">R{freelance.price}</p>
            <Button size="sm" onClick={handleAddToCart}>
              Add to Cart
            </Button>
          </div>
        </div>
      </Link>
    </Card>
  );
};

export default FreelanceCard;
