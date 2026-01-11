import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ServiceRequestProvider } from "@/context/ServiceRequestContext";
import { useEffect, Suspense, lazy } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import PerformanceMonitor from "@/components/ui/PerformanceMonitor";

// Lazy load pages for code splitting
const Index = lazy(() => import("./pages/customer/Index"));
const ProductDetail = lazy(() => import("./pages/customer/ProductDetail"));
const Services = lazy(() => import("./pages/customer/Services"));
const ServiceDetail = lazy(() => import("./pages/customer/ServiceDetails"));
const Grocery = lazy(() => import("./pages/customer/Grocery"));
const GroceryDetail = lazy(() => import("./pages/customer/GroceryDetail"));
const Freelancing = lazy(() => import("./pages/customer/Freelance"));
const FreelancingDetail = lazy(() => import("./pages/customer/FreelanceDetails"));
const SearchResults = lazy(() => import("./pages/customer/SearchResults"));
const Supplier = lazy(() => import("./pages/customer/Supplier"));
const Auth = lazy(() => import("./pages/customer/Auth"));
const CustomerAuth = lazy(() => import("./pages/customer/CustomerAuth"));
const CustomerDashboard = lazy(() => import("./pages/customer/NewCustomerDashboard"));
const CustomerOrders = lazy(() => import("./pages/customer/CustomerOrders"));
const CustomerProfile = lazy(() => import("./pages/customer/CustomerProfile"));
const About = lazy(() => import("./pages/customer/About"));
const HelpCenter = lazy(() => import("./pages/customer/HelpCenter"));
const ContactUs = lazy(() => import("./pages/customer/ContactUs"));
const Cart = lazy(() => import("./pages/customer/Cart"));
const Wishlist = lazy(() => import("./pages/customer/Wishlist"));
const Payment = lazy(() => import("./pages/customer/Payment"));
const PaymentSuccess = lazy(() => import("./pages/customer/PaymentSuccess"));
const PaymentFailed = lazy(() => import("./pages/customer/PaymentFailed"));
const SupplierDashboard = lazy(() => import("./pages/supplier/SupplierDashboard"));
const SupplierProducts = lazy(() => import("./pages/supplier/SupplierProducts"));
const SupplierOrders = lazy(() => import("./pages/supplier/SupplierOrders"));
const SupplierIncomes = lazy(() => import("./pages/supplier/SupplierIncomes"));
const SupplierExpenses = lazy(() => import("./pages/supplier/SupplierExpenses"));
const SupplierServiceRequests = lazy(() => import("./pages/supplier/SupplierServiceRequests"));
const SupplierOptimize = lazy(() => import("./pages/supplier/SupplierOptimize"));
const SupplierShopSettings = lazy(() => import("./pages/supplier/SupplierShopSettings"));
const NotFound = lazy(() => import("./pages/customer/NotFound"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

const App = () => {
  useEffect(() => {
    // Hide the initial HTML loader immediately when React starts
    const initialLoader = document.getElementById('initial-loader');
    if (initialLoader) {
      initialLoader.style.display = 'none';
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ServiceRequestProvider>
        <WishlistProvider>
          <CartProvider>
            <TooltipProvider>
              <PerformanceMonitor />
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/service/:id" element={<ServiceDetail />} />
                    <Route path="/groceries" element={<Grocery />} />
                    <Route path="/grocery/:id" element={<GroceryDetail />} />
                    <Route path="/freelance" element={<Freelancing />} />
                    <Route path="/freelance/:id" element={<FreelancingDetail />} />
                    <Route path="/search" element={<SearchResults />} />
                    <Route path="/supplier/:id" element={<Supplier />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/customer-auth" element={<CustomerAuth />} />
                    <Route path="/customer/dashboard" element={<CustomerDashboard />} />
                    <Route path="/customer/orders" element={<CustomerOrders />} />
                    <Route path="/customer/profile" element={<CustomerProfile />} />
                    <Route path="/supplier/dashboard" element={<SupplierDashboard />} />
                    <Route path="/supplier/products" element={<SupplierProducts />} />
                    <Route path="/supplier/orders" element={<SupplierOrders />} />
                    <Route path="/supplier/incomes" element={<SupplierIncomes />} />
                    <Route path="/supplier/expenses" element={<SupplierExpenses />} />
                    <Route path="/supplier/service-requests" element={<SupplierServiceRequests />} />
                    <Route path="/supplier/optimize" element={<SupplierOptimize />} />
                    <Route path="/supplier/shop-settings" element={<SupplierShopSettings />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/help-center" element={<HelpCenter />} />
                    <Route path="/contact" element={<ContactUs />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/payment" element={<Payment />} />
                    <Route path="/payment/success" element={<PaymentSuccess />} />
                    <Route path="/payment/failed" element={<PaymentFailed />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </CartProvider>
        </WishlistProvider>
      </ServiceRequestProvider>
    </QueryClientProvider>
  );
};

export default App;
