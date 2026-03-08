import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import CustomerNav from "@/components/customer/CustomerNav";
import { Loading } from "@/components/ui/loading-spinner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Package, DollarSign, ShoppingBag, ArrowRight } from "lucide-react";

const CustomerDashboard = () => {
  const { loading: authLoading, signOut } = useCustomerAuth();
  const [searchParams] = useSearchParams();
  const [stats, setStats] = useState({
    totalOrders: 0,
    wishlistItems: 0,
    cartValue: 0,
    totalSpent: 0,
  });

  // Check for redirect flags from login
  const showEmptyCartMessage = searchParams.get("emptyCart") === "true";
  const isNewAccount = searchParams.get("newAccount") === "true";

  // Clear the URL parameters after reading them
  useEffect(() => {
    if (showEmptyCartMessage || isNewAccount) {
      // Remove the query parameters from URL after a short delay
      const timer = setTimeout(() => {
        window.history.replaceState({}, document.title, "/customer/dashboard");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showEmptyCartMessage, isNewAccount]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch orders - using the authenticated user's ID
      const { data: orders } = await supabase
        .from("orders")
        .select("id, total_amount")
        .eq("customer_id", user.id);

      // Note: wishlist and cart tables don't exist in the database schema yet
      // Setting these to 0 for now

      const totalSpent = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      setStats({
        totalOrders: orders?.length || 0,
        wishlistItems: 0,
        cartValue: 0,
        totalSpent,
      });
    };

    fetchDashboardStats();
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <CustomerNav onSignOut={signOut} />
        <div className="min-h-screen flex items-center justify-center">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <CustomerNav onSignOut={signOut} />
      
      <div className="mx-auto max-w-7xl py-4 md:py-8 px-4 lg:ml-64 lg:max-w-[calc(100vw-16rem)]">
        <h1 className="text-2xl md:text-4xl font-bold mb-6 md:mb-8">My Dashboard</h1>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total Orders</p>
                <p className="text-xl md:text-3xl font-bold">{stats.totalOrders}</p>
              </div>
              <ShoppingCart className="h-8 w-8 md:h-10 md:w-10 text-primary" />
            </div>
          </Card>

          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Wishlist Items</p>
                <p className="text-xl md:text-3xl font-bold">{stats.wishlistItems}</p>
              </div>
              <Heart className="h-8 w-8 md:h-10 md:w-10 text-primary" />
            </div>
          </Card>

          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Cart Value</p>
                <p className="text-xl md:text-3xl font-bold">R{stats.cartValue.toFixed(2)}</p>
              </div>
              <Package className="h-8 w-8 md:h-10 md:w-10 text-primary" />
            </div>
          </Card>

          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total Spent</p>
                <p className="text-xl md:text-3xl font-bold">R{stats.totalSpent.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 md:h-10 md:w-10 text-primary" />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Contextual Messages Section */}
          {(showEmptyCartMessage || isNewAccount) && (
            <Card className="p-6 border-amber-200 bg-amber-50">
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-amber-600" />
                {isNewAccount ? "Welcome to InstaGoods!" : "Your Cart is Empty"}
              </h2>
              {isNewAccount ? (
                <p className="text-muted-foreground mb-4">
                  Thank you for creating your account. Start exploring our wide range of products and services to find exactly what you need.
                </p>
              ) : (
                <p className="text-muted-foreground mb-4">
                  You haven't added any items to your cart yet. Browse our products and add items to get started!
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link to="/">
                    Browse Products
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/services">
                    Explore Services
                  </Link>
                </Button>
              </div>
            </Card>
          )}

          {/* Welcome Card */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Welcome Back!</h2>
            <p className="text-muted-foreground">
              View your orders, manage your wishlist, and update your profile from the sidebar.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
