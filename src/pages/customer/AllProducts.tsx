import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";
import ProductCard from "@/components/customer/ProductCard";
import CategoryNav from "@/components/customer/CategoryNav";
import { Loading } from "@/components/ui/loading-spinner";
import { useMarketplaceProducts } from "@/hooks/useMarketplaceProducts";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useDeliveryAndAvailable } from "@/context/OnlyAvailableContext";
import { useLocation } from "@/context/LocationContext";
import { haversineDistance } from "@/lib/distance";
import { geocodeAddress } from "@/lib/geocode";

const AllProducts = () => {
  const [searchParams] = useSearchParams();
  const { products, loading, error } = useMarketplaceProducts();
  const [selectedMainCategory, setSelectedMainCategory] = useState(
    searchParams.get("category") || "All"
  );
  const [selectedSubCategory, setSelectedSubCategory] = useState(
    searchParams.get("sub") || "All"
  );
  const [search, setSearch] = useState("");
  const { address: userAddress } = useLocation();
  const { onlyAvailable, deliveryOnly } = useDeliveryAndAvailable();
  const [userLatLng, setUserLatLng] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (userAddress) {
      geocodeAddress(userAddress).then(setUserLatLng);
    } else {
      setUserLatLng(null);
    }
  }, [userAddress]);

  const handleMainCategoryChange = (cat: string) => {
    setSelectedMainCategory(cat);
    setSelectedSubCategory("All");
  };

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (selectedMainCategory !== "All" && p.main_category !== selectedMainCategory) return false;
      if (selectedSubCategory !== "All" && p.sub_category !== selectedSubCategory) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !(p.description ?? "").toLowerCase().includes(q)) return false;
      }
      if (deliveryOnly && p.no_delivery) return false;
      if (onlyAvailable && userLatLng) {
        if (p.available_everywhere) return true;
        if (p.delivery_lat && p.delivery_lng && typeof p.delivery_radius_km === "number") {
          const dist = haversineDistance(userLatLng.lat, userLatLng.lng, p.delivery_lat, p.delivery_lng);
          return dist <= p.delivery_radius_km;
        }
        return false;
      }
      return true;
    });
  }, [products, selectedMainCategory, selectedSubCategory, search, deliveryOnly, onlyAvailable, userLatLng]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="container py-8 flex-1">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">All Products</h1>
        <p className="text-muted-foreground mb-6">
          Browse everything available on InstaGoods from local suppliers near you.
        </p>

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category filter */}
        <div className="mb-8">
          <CategoryNav
            selectedMainCategory={selectedMainCategory}
            selectedSubCategory={selectedSubCategory}
            onMainCategoryChange={handleMainCategoryChange}
            onSubCategoryChange={setSelectedSubCategory}
          />
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <Loading />
          </div>
        )}

        {error && (
          <p className="text-center text-destructive py-16">{error}</p>
        )}

        {!loading && !error && (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
            </p>
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                No products match your filters.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-6">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AllProducts;
