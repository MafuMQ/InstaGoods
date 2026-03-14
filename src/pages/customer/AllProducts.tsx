import { useState, useMemo } from "react";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";
import ProductCard from "@/components/customer/ProductCard";
import CategoryNav from "@/components/customer/CategoryNav";
import { Loading } from "@/components/ui/loading-spinner";
import { useMarketplaceProducts } from "@/hooks/useMarketplaceProducts";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const AllProducts = () => {
  const { products, loading, error } = useMarketplaceProducts();
  const [selectedMainCategory, setSelectedMainCategory] = useState("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");
  const [search, setSearch] = useState("");

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
        return (
          p.name.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, selectedMainCategory, selectedSubCategory, search]);

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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
