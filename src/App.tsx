import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Supplier from "./pages/Supplier";
import Auth from "./pages/Auth";
import SupplierDashboard from "./pages/supplier/SupplierDashboard";
import SupplierProducts from "./pages/supplier/SupplierProducts";
import SupplierOrders from "./pages/supplier/SupplierOrders";
import SupplierIncomes from "./pages/supplier/SupplierIncomes";
import SupplierExpenses from "./pages/supplier/SupplierExpenses";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/supplier/:id" element={<Supplier />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/supplier/dashboard" element={<SupplierDashboard />} />
          <Route path="/supplier/products" element={<SupplierProducts />} />
          <Route path="/supplier/orders" element={<SupplierOrders />} />
          <Route path="/supplier/incomes" element={<SupplierIncomes />} />
          <Route path="/supplier/expenses" element={<SupplierExpenses />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
