import { useState } from "react";
import { Link, useLocation as useRouterLocation } from "react-router-dom";
import Header from "@/components/customer/Header";
import ProductCard from "@/components/customer/ProductCard";
import ServiceCard from "@/components/customer/ServiceCard";
import GroceryCard from "@/components/customer/GroceryCard";
import FreelanceCard from "@/components/customer/FreelanceCard";
import SupplierCard from "@/components/customer/SupplierCard";
import CategoryNav from "@/components/customer/CategoryNav";
import { freelance, services, groceries, suppliers } from "@/lib/data";
import { useMarketplaceProducts } from "@/hooks/useMarketplaceProducts";
import { useLocation } from "@/context/LocationContext";
import { haversineDistance } from "@/lib/distance";
import { useEffect, useState as useReactState, useRef } from "react";
import { useDeliveryAndAvailable } from "@/context/OnlyAvailableContext";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import CarouselWithDots from "./CarouselWithDots";
import product1 from "@/assets/hero-banner.jpg";
import service1 from "@/assets/Plumber-bg.jpg";
import grocery1 from "@/assets/Grocery-bg.jpg";
import freelance1 from "@/assets/Freelancer-bg.jpg";
import { geocodeAddress } from "@/lib/geocode";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const routerLocation = useRouterLocation();
  const scrollPositionRef = useRef<number>(0);
  
  // Try to restore state from history or sessionStorage
  const getInitialState = () => {
    const historyState = routerLocation.state as any;
    if (historyState?.selectedMainCategory) {
      return {
        mainCategory: historyState.selectedMainCategory,
        subCategory: historyState.selectedSubCategory || "All",
        scrollPosition: historyState.scrollPosition || 0
      };
    }
    
    // Fallback to sessionStorage
    const savedState = sessionStorage.getItem('indexPageState');
    if (savedState) {
      try {
        return JSON.parse(savedState);
      } catch (e) {
        return { mainCategory: "All", subCategory: "All", scrollPosition: 0 };
      }
    }
    
    return { mainCategory: "All", subCategory: "All", scrollPosition: 0 };
  };
  
  const initialState = getInitialState();
  const [selectedMainCategory, setSelectedMainCategory] = useState(initialState.mainCategory);
  const [selectedSubCategory, setSelectedSubCategory] = useState(initialState.subCategory);
  const [dbSuppliers, setDbSuppliers] = useReactState<any[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useReactState(false);
  // deliveryOnly and onlyAvailable state moved to context
  const { address: userAddress } = useLocation();
  const [userLatLng, setUserLatLng] = useReactState<{ lat: number; lng: number } | null>(null);
  const { onlyAvailable, deliveryOnly } = useDeliveryAndAvailable();
  
  // Fetch products from Supabase
  const { products, loading: productsLoading, error: productsError } = useMarketplaceProducts();
  
  // Geocode user address to lat/lng
  useEffect(() => {
    if (userAddress) {
      geocodeAddress(userAddress).then(setUserLatLng);
    } else {
      setUserLatLng(null);
    }
  }, [userAddress]);

  // Debug logging
  useEffect(() => {
    console.log('DEBUG: onlyAvailable =', onlyAvailable, 'userLatLng =', userLatLng, 'userAddress =', userAddress);
  }, [onlyAvailable, userLatLng, userAddress]);

  // Save state to sessionStorage whenever filters change
  useEffect(() => {
    const state = {
      mainCategory: selectedMainCategory,
      subCategory: selectedSubCategory,
      scrollPosition: scrollPositionRef.current
    };
    sessionStorage.setItem('indexPageState', JSON.stringify(state));
  }, [selectedMainCategory, selectedSubCategory]);

  // Restore scroll position after component mounts
  useEffect(() => {
    if (initialState.scrollPosition > 0) {
      // Use setTimeout to ensure DOM is fully rendered
      setTimeout(() => {
        window.scrollTo({
          top: initialState.scrollPosition,
          behavior: 'instant' as ScrollBehavior
        });
      }, 100);
    }
  }, []);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      scrollPositionRef.current = window.scrollY;
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch database suppliers when "Shop by Business" is selected
  useEffect(() => {
  if (selectedMainCategory === "Shop by Business") {
      fetchSuppliers();
    }
  }, [selectedMainCategory]);

  const fetchSuppliers = async () => {
    setSuppliersLoading(true);
    const { data, error } = await supabase
      .from("suppliers")
      .select("id, business_name, description, location, logo_url")
      .order("business_name");
    
    if (!error && data) {
      setDbSuppliers(data);
    }
    setSuppliersLoading(false);
  };

  // Combine static and database suppliers
  const allSuppliers = [...suppliers, ...dbSuppliers];

//   Products
  const filteredProducts = products.filter((p) => {
    if (selectedMainCategory !== "All" && p.main_category !== selectedMainCategory) return false;
    if (selectedSubCategory !== "All" && p.sub_category !== selectedSubCategory) return false;
    if (deliveryOnly && p.no_delivery) return false;
    if (onlyAvailable && userLatLng) {
      if (p.available_everywhere) return true;
      if (p.delivery_lat && p.delivery_lng && typeof p.delivery_radius_km === 'number') {
        const dist = haversineDistance(userLatLng.lat, userLatLng.lng, p.delivery_lat, p.delivery_lng);
        return dist <= p.delivery_radius_km;
      }
      return false;
    }
    return true;
  });

// Services
   const filteredServices = services.filter((p) => {
    if (selectedMainCategory !== "All" && p.mainCategory !== selectedMainCategory) return false;
    if (selectedSubCategory !== "All" && p.subCategory !== selectedSubCategory) return false;
    if (onlyAvailable && userLatLng) {
      if (p.availableEverywhere) return true;
      if (p.location && typeof p.deliveryRadiusKm === 'number') {
        const dist = haversineDistance(userLatLng.lat, userLatLng.lng, p.location.lat, p.location.lng);
        return dist <= p.deliveryRadiusKm;
      }
      return false;
    }
    return true;
  });

  // Groceries
   const filteredGrocery = groceries.filter((p) => {
    if (selectedMainCategory !== "All" && p.mainCategory !== selectedMainCategory) return false;
    if (selectedSubCategory !== "All" && p.subCategory !== selectedSubCategory) return false;
    if (onlyAvailable && userLatLng) {
      if (p.availableEverywhere) return true;
      if (p.location && typeof p.deliveryRadiusKm === 'number') {
        const dist = haversineDistance(userLatLng.lat, userLatLng.lng, p.location.lat, p.location.lng);
        return dist <= p.deliveryRadiusKm;
      }
      return false;
    }
    return true;
  });

  // Freelancing
   const filteredFreelance = freelance.filter((p) => {
    if (selectedMainCategory !== "All" && p.mainCategory !== selectedMainCategory) return false;
    if (selectedSubCategory !== "All" && p.subCategory !== selectedSubCategory) return false;
    if (onlyAvailable && userLatLng) {
      if (p.availableEverywhere) return true;
      if (p.location && typeof p.deliveryRadiusKm === 'number') {
        const dist = haversineDistance(userLatLng.lat, userLatLng.lng, p.location.lat, p.location.lng);
        return dist <= p.deliveryRadiusKm;
      }
      return false;
    }
    return true;
  });

  const categories = [
    {
      title: "Discover Unique Handcrafted Treasures",
      description: "Support independent artisans and find one-of-a-kind pieces for your home",
      image: product1,
      link: "/"
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

      {/* Categories Carousel with Dots */}
      <CarouselWithDots categories={categories} />

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

  {/* Shop by Business - Display Supplier Cards */}
  {selectedMainCategory === "Shop by Business" && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-center">Browse Businesses</h2>
            {suppliersLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading businesses...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {allSuppliers.map((supplier) => (
                  <SupplierCard key={supplier.id} supplier={supplier} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Products */}
  {selectedMainCategory !== "Shop by Business" && (
          <>
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
          </>
        )}
        {/*<div className="p-8 text-center">
            <Button size="lg" variant="secondary">
                View More
            </Button>
        </div> */}

      </section>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">About</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/about">Our Story</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/help-center">Help Center</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">InstaGoods</h3>
              <p className="text-muted-foreground text-sm">
                Empowering local creators. Discover, shop, and support unique businesses near you.
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
