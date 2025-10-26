import { Link } from "react-router-dom";
import { Heart, Star } from "lucide-react";
import { Grocery, suppliers } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface GroceryCardProps {
  grocery: Grocery;
}

const GroceryCard = ({ grocery }: GroceryCardProps) => {
  const supplier = suppliers.find((s) => s.id === grocery.supplierId);

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-hover)]">
      <Link to={`/grocery/${grocery.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={grocery.image}
            alt={grocery.name}
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
            {grocery.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
            {supplier?.name}
          </p>
          <div className="flex items-center gap-1 mb-3">
            <Star className="h-3 w-3 fill-accent text-accent" />
            <span className="text-sm font-medium">{grocery.rating}</span>
            <span className="text-sm text-muted-foreground">
              ({grocery.reviews})
            </span>
          </div>
          <p className="text-lg font-bold text-primary">R{grocery.price}</p>
        </div>
      </Link>
    </Card>
  );
};

export default GroceryCard;
