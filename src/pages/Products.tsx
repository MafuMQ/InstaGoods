import { useState } from "react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import CategoryNav from "@/components/CategoryNav";
import { products } from "@/lib/data";
import { useMarketplaceProducts } from "@/hooks/useMarketplaceProducts";

const Products = () => {
  const [selectedMainCategory, setSelectedMainCategory] = useState("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");
  const { products: marketplaceProducts, loading, error } = useMarketplaceProducts();

  // Combine static products with marketplace products for now
  const allProducts = [...products, ...marketplaceProducts];

  const filteredProducts = allProducts.filter((p) => {
    if (selectedMainCategory === "All") return true;
    
    // Check if it's a marketplace product or static product
    const mainCategory = 'main_category' in p ? p.main_category : p.mainCategory;
    const subCategory = 'sub_category' in p ? p.sub_category : p.subCategory;
    
    if (mainCategory !== selectedMainCategory) return false;
    if (selectedSubCategory === "All") return true;
    return subCategory === selectedSubCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-2">Shop All Products</h1>
        <p className="text-muted-foreground mb-8">
          Explore our curated collection of handcrafted items
        </p>

        <div className="mb-8">
          <CategoryNav
            selectedMainCategory={selectedMainCategory}
            selectedSubCategory={selectedSubCategory}
            onMainCategoryChange={(category) => {
              setSelectedMainCategory(category);
              setSelectedSubCategory("All");
            }}
            onSubCategoryChange={setSelectedSubCategory}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading && (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          )}
          {error && (
            <div className="col-span-full text-center py-8">
              <p className="text-destructive">Error loading products: {error}</p>
            </div>
          )}
          {!loading && !error && filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Products;
