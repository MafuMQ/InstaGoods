import { useState, useMemo } from "react";
import { Link, useLocation as useRouterLocation } from "react-router-dom";
import Header from "@/components/customer/Header";
import ProductCard from "@/components/customer/ProductCard";
import ServiceCard from "@/components/customer/ServiceCard";
import GroceryCard from "@/components/customer/GroceryCard";
import FreelanceCard from "@/components/customer/FreelanceCard";
import SupplierCard from "@/components/customer/SupplierCard";
import CategoryNav from "@/components/customer/CategoryNav";
import { Loading } from "@/components/ui/loading-spinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import product1 from "@/assets/hero-banner.webp";
import service1 from "@/assets/Plumber-bg.webp";
import grocery1 from "@/assets/Grocery-bg.webp";
import freelance1 from "@/assets/Freelancer-bg.webp";
import { geocodeAddress } from "@/lib/geocode";
import { supabase } from "@/integrations/supabase/client";
import { ProviderType } from "@/components/customer/ProviderBadge";
import { Sprout, Handshake, Layers, Store, Heart, Twitter, Instagram, Facebook, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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
  const [selectedProviderType, setSelectedProviderType] = useState<ProviderType | 'all'>('all');
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
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('DEBUG: onlyAvailable =', onlyAvailable, 'userLatLng =', userLatLng, 'userAddress =', userAddress);
    }
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

// Memoized filtering functions to prevent unnecessary recalculations
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
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
  }, [products, selectedMainCategory, selectedSubCategory, deliveryOnly, onlyAvailable, userLatLng]);

  const filteredServices = useMemo(() => {
    return services.filter((p) => {
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
  }, [services, selectedMainCategory, selectedSubCategory, onlyAvailable, userLatLng]);

  // Separate internal (InstaGoods Curated) and external (Verified Partners) services
  const internalServices = useMemo(() => {
    return filteredServices.filter(s => s.providerType === 'internal');
  }, [filteredServices]);

  const externalServices = useMemo(() => {
    return filteredServices.filter(s => s.providerType === 'external' || !s.providerType);
  }, [filteredServices]);

  const filteredGrocery = useMemo(() => {
    return groceries.filter((p) => {
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
  }, [groceries, selectedMainCategory, selectedSubCategory, onlyAvailable, userLatLng]);

  const filteredFreelance = useMemo(() => {
    return freelance.filter((p) => {
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
  }, [freelance, selectedMainCategory, selectedSubCategory, onlyAvailable, userLatLng]);

  const categories = [
    {
      title: "Discover, Shop, and Grow Local",
      description: "Connect with local businesses, shop unique products, and help your community thrive.",
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
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:font-medium"
      >
        Skip to main content
      </a>
      
      <Header />

      {/* Categories Carousel with Dots */}
      <CarouselWithDots categories={categories} />

      {/* Featured Products */}
      <section id="main-content" className="container py-12">
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

        {/* Provider Type Filter - Segmented Control Tabs */}
        <div className="mb-6">
          <Tabs 
            value={selectedProviderType} 
            onValueChange={(value) => setSelectedProviderType(value as ProviderType | 'all')}
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-3 h-auto p-1 bg-muted/50">
              <TabsTrigger 
                value="all" 
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Layers className="w-5 h-5" />
                <span>All Providers</span>
                <span className="ml-auto text-xs bg-muted-foreground/20 px-1.5 py-0.5 rounded-full">
                  {services.length}
                </span>
              </TabsTrigger>
              <TabsTrigger 
                value="internal" 
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Sprout className="w-5 h-5 text-blue-600" />
                <span>InstaGoods Curated</span>
                <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                  {services.filter(s => s.providerType === 'internal').length}
                </span>
              </TabsTrigger>
              <TabsTrigger 
                value="external" 
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Handshake className="w-5 h-5 text-emerald-600" />
                <span>Verified Partners</span>
                <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">
                  {services.filter(s => s.providerType === 'external').length}
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

  {/* Shop by Business - Display Supplier Cards */}
  {selectedMainCategory === "Shop by Business" && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-center">Browse Businesses</h2>
            {suppliersLoading ? (
              <div className="text-center py-12">
                <Loading message="Loading businesses..." />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-6">
                {allSuppliers.map((supplier) => (
                  <SupplierCard key={supplier.id} supplier={supplier} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Items - with Separate Sections for Internal vs External Services */}
        {selectedMainCategory !== "Shop by Business" && (
          <>
            {productsLoading ? (
              <div className="text-center py-12">
                <Loading message="Loading products..." />
              </div>
            ) : (
              <>
                {/* Products, Groceries, and Freelance - Always shown together */}
                {(filteredProducts.length > 0 || filteredGrocery.length > 0 || filteredFreelance.length > 0) && selectedProviderType === 'all' && (
                  <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">Products & More</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-6">
                      {/* Products */}
                      {filteredProducts.slice(0, 8).map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}

                      {/* Groceries */}
                      {filteredGrocery.slice(0, 8).map((grocery) => (
                        <GroceryCard key={grocery.id} grocery={grocery} />
                      ))}

                      {/* Freelancing */}
                      {filteredFreelance.slice(0, 8).map((freelance) => (
                        <FreelanceCard key={freelance.id} freelance={freelance} />
                      ))}
                    </div>
                  </div>
                )}

                {/* InstaGoods Curated Section - Internal Services */}
                {(selectedProviderType === 'all' || selectedProviderType === 'internal') && (
                  <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Sprout className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">InstaGoods Curated</h2>
                        <p className="text-sm text-muted-foreground">Services managed directly by InstaGoods</p>
                      </div>
                      <span className="ml-auto bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        {internalServices.length} services
                      </span>
                    </div>
                    {internalServices.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-6">
                        {internalServices.slice(0, 8).map((service) => (
                          <ServiceCard key={service.id} service={service} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground py-8 text-center">No curated services available in this category</p>
                    )}
                  </div>
                )}

                {/* Divider between sections when showing all */}
                {selectedProviderType === 'all' && internalServices.length > 0 && externalServices.length > 0 && (
                  <Separator className="my-12" />
                )}

                {/* Verified Partners Section - External Services */}
                {(selectedProviderType === 'all' || selectedProviderType === 'external') && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <Handshake className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">Verified Partners</h2>
                        <p className="text-sm text-muted-foreground">Services from trusted external providers</p>
                      </div>
                      <span className="ml-auto bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                        {externalServices.length} services
                      </span>
                    </div>
                    {externalServices.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-6">
                        {externalServices.slice(0, 8).map((service) => (
                          <ServiceCard key={service.id} service={service} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground py-8 text-center">No partner services available in this category</p>
                    )}
                  </div>
                )}
              </>
            )}
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Admin</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/admin/suppliers">Supplier Management</Link></li>
              </ul>
            </div>
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
          <div className="mt-8 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-muted-foreground text-sm">
            <div className="flex items-center gap-2 hover:text-primary transition-colors duration-300">
              <span className="font-semibold text-foreground">© {new Date().getFullYear()} InstaGoods</span>
              <span className="hidden sm:inline">All rights reserved.</span>
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="https://twitter.com/instagoods" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors duration-300 transform hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a 
                href="https://instagram.com/instagoods" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors duration-300 transform hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="https://facebook.com/instagoods" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors duration-300 transform hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="mailto:hello@instagoods.co.za"
                className="hover:text-primary transition-colors duration-300 transform hover:scale-110"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
