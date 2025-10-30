import { Link, useLocation as useRouterLocation } from "react-router-dom";
import { Heart, Star } from "lucide-react";
import { Service, suppliers } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useWishlist } from "@/context/WishlistContext";

interface ServiceCardProps {
  service: Service;
}

const ServiceCard = ({ service }: ServiceCardProps) => {
  const routerLocation = useRouterLocation();
  const supplier = suppliers.find((s) => s.id === service.supplierId);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isInWishlist(service.id)) {
      removeFromWishlist(service.id);
    } else {
      addToWishlist(service);
    }
  };

  // Prepare state to pass when navigating
  const getLinkState = () => {
    const savedState = sessionStorage.getItem('indexPageState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        return {
          selectedMainCategory: state.mainCategory,
          selectedSubCategory: state.subCategory,
          scrollPosition: window.scrollY
        };
      } catch (e) {
        return undefined;
      }
    }
    return undefined;
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-hover)]">
      <Link to={`/service/${service.id}`} state={getLinkState()} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={service.image}
            alt={service.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <Button
            variant="ghost"
            size="icon"
            className={`absolute right-2 top-2 bg-card/80 backdrop-blur hover:bg-card ${
              isInWishlist(service.id) ? 'text-red-500' : ''
            }`}
            onClick={handleToggleWishlist}
          >
            <Heart className={`h-4 w-4 ${isInWishlist(service.id) ? 'fill-current' : ''}`} />
          </Button>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-base mb-1 line-clamp-2">
            {service.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
            {supplier?.name}
          </p>
          <div className="flex items-center gap-1 mb-3">
            <Star className="h-3 w-3 fill-accent text-accent" />
            <span className="text-sm font-medium">{service.rating}</span>
            <span className="text-sm text-muted-foreground">
              ({service.reviews})
            </span>
          </div>
          <div className="flex flex-col gap-1 mb-2">
            <span className="text-xs text-muted-foreground">
              {service.availableEverywhere ? "Available everywhere" : `Region: ${service.region || 'N/A'}`}
            </span>
            {!service.availableEverywhere && service.deliveryRadiusKm && (
              <span className="text-xs text-muted-foreground">
                Service radius: {service.deliveryRadiusKm} km
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-primary">R{service.price}</p>
          </div>
        </div>
      </Link>
    </Card>
  );
};

export default ServiceCard;
