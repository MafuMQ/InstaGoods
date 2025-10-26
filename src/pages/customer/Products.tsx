import { useState } from "react";
import Header from "@/components/customer/Header";
import ProductCard from "@/components/customer/ProductCard";
import CategoryNav from "@/components/customer/CategoryNav";
import { products, suppliers } from "@/lib/data";

const Products = () => {
  const [selectedMainCategory, setSelectedMainCategory] = useState("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");

  const filteredProducts = products.filter((p) => {
    if (selectedMainCategory === "All") return true;
    if (selectedMainCategory === "Shop by Store") {
      if (selectedSubCategory === "All") return true;
      const supplier = suppliers.find(s => s.id === p.supplierId);
      return supplier?.name === selectedSubCategory;
    }
    if (p.mainCategory !== selectedMainCategory) return false;
    if (selectedSubCategory === "All") return true;
    return p.subCategory === selectedSubCategory;
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
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Products;
