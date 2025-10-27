
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Star, MapPin } from "lucide-react";
import Header from "@/components/customer/Header";
import ProductCard from "@/components/customer/ProductCard";
// import { products } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const Supplier = () => {

  const { id } = useParams();
  const [supplier, setSupplier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [supplierProducts, setSupplierProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchSupplier = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("suppliers")
        .select("id, business_name, description, location, logo_url, banner_url")
        .eq("id", id)
        .single();
      setSupplier(data);
      setLoading(false);
    };
    const fetchProducts = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("supplier_id", id);
      setSupplierProducts(data || []);
    };
    if (id) {
      fetchSupplier();
      fetchProducts();
    }
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

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
        {supplier.banner_url && (
          <div className="w-full h-40 mb-4 rounded-lg overflow-hidden">
            <img src={supplier.banner_url} alt="Banner" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="container py-12">
          <div className="flex items-start gap-6">
            {supplier.logo_url ? (
              <img
                src={supplier.logo_url}
                alt="Logo"
                className="h-24 w-24 rounded-full object-cover border-2 border-primary bg-white"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold text-3xl">
                {supplier.business_name?.charAt(0) || "?"}
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{supplier.business_name}</h1>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{supplier.location}</span>
                </div>
                {/* Rating and sales data not available in current schema */}
                {/*
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span className="font-medium">{supplier.rating}</span>
                </div>
                <span className="text-muted-foreground">
                  {supplier.totalSales} sales
                </span>
                */}
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
          Products from {supplier.business_name}
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
