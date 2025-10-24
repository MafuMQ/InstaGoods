import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import CategoryNav from "@/components/CategoryNav";
import { products } from "@/lib/data";
import { Button } from "@/components/ui/button";
import heroBanner from "@/assets/hero-banner.jpg";

const Index = () => {
  const [selectedMainCategory, setSelectedMainCategory] = useState("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");

  const filteredProducts = products.filter((p) => {
    if (selectedMainCategory === "All") return true;
    if (p.mainCategory !== selectedMainCategory) return false;
    if (selectedSubCategory === "All") return true;
    return p.subCategory === selectedSubCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[400px] overflow-hidden">
        <img
          src={heroBanner}
          alt="Artisan crafts workspace"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 to-foreground/40" />
        <div className="absolute inset-0 flex items-center">
          <div className="container">
            <div className="max-w-2xl text-background">
              <h1 className="text-5xl font-bold mb-4">
                Discover Unique Handcrafted Treasures
              </h1>
              <p className="text-xl mb-6 text-background/90">
                Support independent artisans and find one-of-a-kind pieces for your home
              </p>
              <Link to="/products">
                <Button size="lg" variant="secondary">
                  Shop Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Featured Items</h2>
          <Link to="/products">
            <Button variant="ghost">View All</Button>
          </Link>
        </div>

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
          {filteredProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Shop</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/products">All Products</Link></li>
                <li><Link to="/products">Categories</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">About</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#">Our Story</a></li>
                <li><a href="#">Artisans</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Artisan Market</h3>
              <p className="text-muted-foreground text-sm">
                Connecting artisans with people who appreciate handcrafted quality.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-muted-foreground text-sm">
            © 2024 Artisan Market. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
