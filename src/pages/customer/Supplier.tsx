import { useParams, Link } from "react-router-dom";
import { Star, MapPin } from "lucide-react";
import Header from "@/components/customer/Header";
import ProductCard from "@/components/customer/ProductCard";
import { products, suppliers } from "@/lib/data";
import { Button } from "@/components/ui/button";

const Supplier = () => {
  const { id } = useParams();
  const supplier = suppliers.find((s) => s.id === id);
  const supplierProducts = products.filter((p) => p.supplierId === id);

  if (!supplier) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Supplier not found</h1>
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
      
      {/* Supplier Header */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border-b">
        <div className="container py-12">
          <div className="flex items-start gap-6">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold text-3xl">
              {supplier.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{supplier.name}</h1>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{supplier.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span className="font-medium">{supplier.rating}</span>
                </div>
                <span className="text-muted-foreground">
                  {supplier.totalSales} sales
                </span>
              </div>
              <p className="text-muted-foreground max-w-2xl">
                {supplier.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="container py-12">
        <h2 className="text-2xl font-bold mb-6">
          Products from {supplier.name}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {supplierProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Supplier;
