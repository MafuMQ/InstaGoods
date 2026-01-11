import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import CustomerNav from "@/components/customer/CustomerNav";
import { Loading } from "@/components/ui/loading-spinner";
import { Card } from "@/components/ui/card";
import { ShoppingCart, Heart, Package, DollarSign } from "lucide-react";

const CustomerDashboard = () => {
  const { loading, customerId, signOut } = useCustomerAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    wishlistItems: 0,
    cartValue: 0,
    totalSpent: 0,
  });

  useEffect(() => {
    if (customerId) {
      fetchDashboardStats();
    }
  }, [customerId]);

  const fetchDashboardStats = async () => {
    if (!customerId) return;

    // Fetch orders - using correct column name from database schema
    const { data: orders } = await supabase
      .from("orders")
      .select("id, total_amount")
      .eq("customer_id", customerId);

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

  if (loading) {
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
