import { Link, useLocation as useRouterLocation } from "react-router-dom";
import { Star, MapPin, Store } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SupplierCardProps {
  supplier: {
    id: string;
    business_name?: string;
    name?: string;
    description: string;
    location: string;
    logo_url?: string;
    rating?: number;
    totalSales?: number;
  };
}

const SupplierCard = ({ supplier }: SupplierCardProps) => {
  const routerLocation = useRouterLocation();
  const businessName = supplier.business_name || supplier.name || "Unknown Business";
  const supplierRating = supplier.rating || 4.5;
  const supplierSales = supplier.totalSales || 15;
  
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
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold text-2xl flex-shrink-0">
            {supplier.logo_url ? (
              <img
                src={supplier.logo_url}
                alt={businessName}
                className="h-full w-full object-cover rounded-full"
              />
            ) : (
              businessName.charAt(0)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg mb-1 truncate">{businessName}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{supplier.location}</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span className="font-medium">{supplierRating.toFixed(1)}</span>
              <span className="text-muted-foreground">({supplierSales}+ sales)</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {supplier.description}
        </p>
        <Link to={`/supplier/${supplier.id}`} state={getLinkState()}>
          <Button className="w-full" variant="outline">
            <Store className="mr-2 h-4 w-4" />
            Visit Business
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default SupplierCard;
