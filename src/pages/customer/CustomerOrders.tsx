import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import CustomerNav from "@/components/customer/CustomerNav";
import { Loading } from "@/components/ui/loading-spinner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface Order {
  id: string;
  order_date: string;
  status: string;
  total_amount: number;
  product_name: string;
}

const CustomerOrders = () => {
  const { loading: authLoading, signOut, user: authUser } = useCustomerAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Format user data for CustomerNav
  const user = authUser ? {
    name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
    email: authUser.email || '',
    avatar: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture
  } : undefined;

  useEffect(() => {
    // Get the authenticated user and fetch orders
    const fetchOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setOrdersLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          order_date,
          status,
          total_amount,
          product_name
        `)
        .eq("customer_id", user.id)
        .order("order_date", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
      } else {
        setOrders(data || []);
      }
      setOrdersLoading(false);
    };

    fetchOrders();
    
    // Listen for order updates from PaymentSuccess
    const handleOrdersUpdated = (event: Event) => {
      console.log("Orders updated event received:", event);
      fetchOrders();
    };
    
    // Also check for newly created orders in localStorage on mount
    const checkNewOrders = () => {
      const newOrders = localStorage.getItem('newly_created_orders');
      if (newOrders) {
        console.log("Found newly created orders, refreshing...");
        localStorage.removeItem('newly_created_orders');
        fetchOrders();
      }
    };
    
    // Check immediately and set up listener
    checkNewOrders();
    window.addEventListener('orders-updated', handleOrdersUpdated);
    
    // Set up storage listener for cross-tab communication
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'newly_created_orders' && e.newValue) {
        console.log("Storage change detected for new orders");
        localStorage.removeItem('newly_created_orders');
        fetchOrders();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('orders-updated', handleOrdersUpdated);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <CustomerNav onSignOut={signOut} user={user} />
        <div className="min-h-screen flex items-center justify-center">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <CustomerNav onSignOut={signOut} user={user} />
      
      <div className="mx-auto max-w-7xl py-4 md:py-8 px-4 lg:ml-64 lg:max-w-[calc(100vw-16rem)]">
        <h1 className="text-2xl md:text-4xl font-bold mb-6 md:mb-8">My Orders</h1>

        {ordersLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loading />
          </div>
        ) : orders.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">You haven't placed any orders yet.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(order.order_date), { addSuffix: true })}
                    </p>
                    <p className="text-sm">{order.product_name}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-2xl font-bold">R{Number(order.total_amount).toFixed(2)}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOrders;
