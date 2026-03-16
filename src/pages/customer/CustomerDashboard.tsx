import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import CustomerNav from "@/components/customer/CustomerNav";
import { Loading } from "@/components/ui/loading-spinner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, Package, DollarSign, ShoppingBag, ArrowRight, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface RecentOrder {
  id: string;
  order_date: string;
  status: string;
  total_amount: number;
  product_name: string;
}

const CustomerDashboard = () => {
  const { loading: authLoading, signOut, user: authUser } = useCustomerAuth();
  const { wishlistItemIds } = useWishlist();
  const { cartItems, getCartTotal } = useCart();
  const [searchParams] = useSearchParams();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    wishlistItems: 0,
    cartValue: 0,
    totalSpent: 0,
  });

  // Order summary state for dashboard
  const [orderSummary, setOrderSummary] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  // Format user data for CustomerNav
  const user = authUser ? {
    name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
    email: authUser.email || '',
    avatar: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture
  } : undefined;

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  useEffect(() => {
    const fetchDashboardStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch orders with more details for order summary
      const { data: orders } = await supabase
        .from("orders")
        .select("id, order_date, status, total_amount, product_name")
        .eq("customer_id", user.id)
        .order("order_date", { ascending: false });

      // Note: cart table doesn't exist in the database schema yet
      // Setting cart value to 0 for now

      const totalSpent = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const cartValue = getCartTotal();

      setStats({
        totalOrders: orders?.length || 0,
        wishlistItems: wishlistItemIds.length,
        cartValue,
        totalSpent,
      });

      // Calculate order summary
      if (orders) {
        const totalOrders = orders.length;
        const totalSpentVal = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
        const pendingOrders = orders.filter(o => o.status === "pending").length;
        const completedOrders = orders.filter(o => o.status === "completed").length;

        setOrderSummary({
          totalOrders,
          totalSpent: totalSpentVal,
          pendingOrders,
          completedOrders,
        });

        // Get 5 most recent orders
        setRecentOrders(orders.slice(0, 5));
      }
    };

    fetchDashboardStats();
  }, [wishlistItemIds, cartItems]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <CustomerNav 
        onSignOut={signOut} 
        user={user}
        onCollapsedChange={setIsSidebarCollapsed}
      />
      <div className="min-h-screen flex items-center justify-center">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <CustomerNav 
        onSignOut={signOut} 
        user={user} 
        onCollapsedChange={setIsSidebarCollapsed}
      />
      
      <div className={`mx-auto max-w-7xl py-4 md:py-8 px-4 transition-all duration-300 ${
        isSidebarCollapsed ? "lg:ml-16 lg:max-w-[calc(100vw-4rem)]" : "lg:ml-64 lg:max-w-[calc(100vw-16rem)]"
      }`}>
        <h1 className="text-2xl md:text-4xl font-bold mb-6 md:mb-8">My Dashboard</h1>

         {/* Welcome Card */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Welcome Back!</h2>
            <p className="text-muted-foreground">
              View your orders, manage your wishlist, and update your profile from the sidebar.
            </p>
          </Card>

        {/* Order Statistics Cards */}
        <div className="grid grid-cols-2 py-6 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total Orders</p>
                <p className="text-xl md:text-2xl font-bold">{orderSummary.totalOrders}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-primary" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Pending</p>
                <p className="text-xl md:text-2xl font-bold">{orderSummary.pendingOrders}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Completed</p>
                <p className="text-xl md:text-2xl font-bold">{orderSummary.completedOrders}</p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total Spent</p>
                <p className="text-xl md:text-2xl font-bold">R{orderSummary.totalSpent.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          
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

        </div>

        {/* Recent Orders Section */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Package className="h-5 w-5" />
              Recent Orders
            </h2>
            {orderSummary.totalOrders > 5 && (
              <Button variant="link" asChild>
                <a href="/customer/orders">View All Orders</a>
              </Button>
            )}
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">You haven't placed any orders yet.</p>
              <Button className="mt-4" asChild>
                <a href="/">Start Shopping</a>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div 
                  key={order.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold truncate">Order #{order.id.slice(0, 8)}</p>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{order.product_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.order_date 
                        ? formatDistanceToNow(new Date(order.order_date), { addSuffix: true })
                        : "Date not available"}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold">R{Number(order.total_amount).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-6">
          {/* Contextual Messages Section */}
          {stats.cartValue === 0 && (showEmptyCartMessage || isNewAccount) && (
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

         
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
