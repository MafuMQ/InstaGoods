import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ServiceRequestProvider } from "@/context/ServiceRequestContext";
import Index from "./pages/customer/Index";
import Products from "./pages/customer/Products";
import ProductDetail from "./pages/customer/ProductDetail";
import Services from "./pages/customer/Services";
import ServiceDetail from "./pages/customer/ServiceDetails";
import Grocery from "./pages/customer/Grocery";
import GroceryDetail from "./pages/customer/GroceryDetail";
import Freelancing from "./pages/customer/Freelance";
import FreelancingDetail from "./pages/customer/FreelanceDetails";
import SearchResults from "./pages/customer/SearchResults";
import Supplier from "./pages/customer/Supplier";
import Auth from "./pages/customer/Auth";
import About from "./pages/customer/About";
import Cart from "./pages/customer/Cart";
import Wishlist from "./pages/customer/Wishlist";
import SupplierDashboard from "./pages/supplier/SupplierDashboard";
import SupplierProducts from "./pages/supplier/SupplierProducts";
import SupplierOrders from "./pages/supplier/SupplierOrders";
import SupplierIncomes from "./pages/supplier/SupplierIncomes";
import SupplierExpenses from "./pages/supplier/SupplierExpenses";
import SupplierServiceRequests from "./pages/supplier/SupplierServiceRequests";
import SupplierOptimize from "./pages/supplier/SupplierOptimize";
import NotFound from "./pages/customer/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ServiceRequestProvider>
      <WishlistProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/services" element={<Services/>}/>
                  <Route path="/service/:id" element={<ServiceDetail />} />
                  <Route path="/groceries" element={<Grocery/>}/>
                  <Route path="/grocery/:id" element={<GroceryDetail />} />
                  <Route path="/freelance" element={<Freelancing/>}/>
                  <Route path="/freelance/:id" element={<FreelancingDetail />} />
                  <Route path="/search" element={<SearchResults />} />
                  <Route path="/supplier/:id" element={<Supplier />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/supplier/dashboard" element={<SupplierDashboard />} />
                  <Route path="/supplier/products" element={<SupplierProducts />} />
                  <Route path="/supplier/orders" element={<SupplierOrders />} />
                  <Route path="/supplier/incomes" element={<SupplierIncomes />} />
                  <Route path="/supplier/expenses" element={<SupplierExpenses />} />
                  <Route path="/supplier/service-requests" element={<SupplierServiceRequests />} />
                  <Route path="/supplier/optimize" element={<SupplierOptimize />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </WishlistProvider>
    </ServiceRequestProvider>
  </QueryClientProvider>
);

export default App;
