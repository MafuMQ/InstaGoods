import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, Heart, ShoppingBag, Store } from "lucide-react";
import Header from "@/components/customer/Header";
import { services, suppliers } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ServiceRequestForm from "@/components/customer/ServiceRequestForm";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

const ServiceDetail = () => {
  const { id } = useParams();
  const service = services.find((p) => p.id === id);
  const supplier = service ? suppliers.find((s) => s.id === service.supplierId) : null;
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const handleAddToCart = () => {
    if (service) {
      addToCart(service);
    }
  };

  const handleToggleWishlist = () => {
    if (service) {
      if (isInWishlist(service.id)) {
        removeFromWishlist(service.id);
      } else {
        addToWishlist(service);
      }
    }
  };

  if (!service || !supplier) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Service not found</h1>
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
          {/* Service Image */}
          <div className="aspect-square overflow-hidden rounded-lg bg-muted">
            <img
              src={service.image}
              alt={service.name}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Service Info */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold mb-2">{service.name}</h1>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-accent text-accent" />
                <span className="font-medium">{service.rating}</span>
              </div>
              <span className="text-muted-foreground">
                ({service.reviews} reviews)
              </span>
            </div>

            <p className="text-3xl font-bold text-primary mb-6">
              R{service.price}
            </p>

            <p className="text-muted-foreground mb-8 leading-relaxed">
              {service.description}
            </p>

            <div className="flex gap-3 mb-8">
              <Button
                size="lg"
                className="flex-1"
                onClick={() => setIsRequestFormOpen(true)}
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Request Service
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleAddToCart}
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleToggleWishlist}
                className={isInWishlist(service?.id || '') ? 'text-red-500 border-red-300' : ''}
              >
                <Heart className={`h-5 w-5 ${isInWishlist(service?.id || '') ? 'fill-current' : ''}`} />
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
                      Visit Business
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Service Request Form Modal */}
      {service && supplier && (
        <ServiceRequestForm
          isOpen={isRequestFormOpen}
          onClose={() => setIsRequestFormOpen(false)}
          serviceId={service.id}
          serviceName={service.name}
          supplierId={supplier.id}
          supplierName={supplier.name}
        />
      )}
    </div>
  );
};

export default ServiceDetail;
