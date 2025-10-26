import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/customer/Header";
import ProductCard from "@/components/customer/ProductCard";
import ServiceCard from "@/components/customer/ServiceCard";
import GroceryCard from "@/components/customer/GroceryCard";
import FreelanceCard from "@/components/customer/FreelanceCard";
import CategoryNav from "@/components/customer/CategoryNav";
import { freelance, products, services, groceries} from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import heroBanner from "@/assets/hero-banner.jpg";
import product1 from "@/assets/product-1.jpg";
import service1 from "@/assets/service-1.jpg";
import grocery1 from "@/assets/grocery-1.jpg";
import freelance1 from "@/assets/grocery-1.jpg";

const Index = () => {
  const [selectedMainCategory, setSelectedMainCategory] = useState("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");

//   Products
  const filteredProducts = products.filter((p) => {
    if (selectedMainCategory === "All") return true;
    if (p.mainCategory !== selectedMainCategory) return false;
    if (selectedSubCategory === "All") return true;
    return p.subCategory === selectedSubCategory;
  });

// Services
   const filteredServices = services.filter((p) => {
    if (selectedMainCategory === "All") return true;
    if (p.mainCategory !== selectedMainCategory) return false;
    if (selectedSubCategory === "All") return true;
    return p.subCategory === selectedSubCategory;
  });

  // Groceries
   const filteredGrocery = groceries.filter((p) => {
    if (selectedMainCategory === "All") return true;
    if (p.mainCategory !== selectedMainCategory) return false;
    if (selectedSubCategory === "All") return true;
    return p.subCategory === selectedSubCategory;
  });

  // Freelancing
   const filteredFreelance = freelance.filter((p) => {
    if (selectedMainCategory === "All") return true;
    if (p.mainCategory !== selectedMainCategory) return false;
    if (selectedSubCategory === "All") return true;
    return p.subCategory === selectedSubCategory;
  });

  const categories = [
    {
      title: "Discover Unique Handcrafted Treasures",
      description: "Support independent artisans and find one-of-a-kind pieces for your home",
      image: product1,
      link: "/products"
    },
    {
      title: "Professional Services at Your Fingertips",
      description: "Connect with skilled professionals for all your service needs",
      image: service1,
      link: "/services"
    },
    {
      title: "Fresh Groceries Delivered",
      description: "Shop for fresh produce and essentials from local suppliers",
      image: grocery1,
      link: "/grocery"
    },
    {
      title: "Freelance Expertise",
      description: "Hire talented freelancers for creative and technical projects",
      image: freelance1,
      link: "/freelance"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Categories Carousel */}
      <Carousel opts={{ loop: true }} plugins={[Autoplay({ delay: 5000 })]}>
        <CarouselContent>
          {categories.map((category, index) => (
            <CarouselItem key={index}>
              <section className="relative h-[400px] overflow-hidden">
                <img
                  src={category.image}
                  alt={category.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 to-foreground/40" />
                <div className="absolute inset-0 flex items-center">
                  <div className="container">
                    <div className="max-w-2xl text-background">
                      <h1 className="text-5xl font-bold mb-4">
                        {category.title}
                      </h1>
                      <p className="text-xl mb-6 text-background/90">
                        {category.description}
                      </p>
                      <Link to={category.link}>
                        <Button size="lg" variant="secondary">
                          Shop Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      {/* Featured Products */}
      <section className="container py-12">
        {/* <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Featured Items</h2>
          <Link to="/products">
            <Button variant="ghost">View All</Button>
          </Link>
        </div> */}

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
        
        {/* Services */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredServices.slice(0, 8).map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>

        {/* Groceries */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGrocery.slice(0, 8).map((grocery) => (
            <GroceryCard key={grocery.id} grocery={grocery} />
          ))}
        </div>

        {/* Freelancing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFreelance.slice(0, 8).map((freelance) => (
            <FreelanceCard key={freelance.id} freelance={freelance} />
          ))}    
        </div>
        {/*<div className="p-8 text-center">
            <Button size="lg" variant="secondary">
                View More
            </Button>
        </div> */}

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
                <li><Link to="/about">Our Story</Link></li>
                <li><Link to="/about">Artisans</Link></li>
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
              <h3 className="font-bold text-lg mb-4">InstaGoods</h3>
              <p className="text-muted-foreground text-sm">
                Connecting artisans with people who appreciate handcrafted quality.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-muted-foreground text-sm">
            © 2025 InstaGoods. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
