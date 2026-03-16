import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import CustomerNav from "@/components/customer/CustomerNav";
import { Loading } from "@/components/ui/loading-spinner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { OrderTrackingTimeline } from "@/components/customer/OrderTrackingTimeline";
import { MapPin, ChevronDown, ChevronUp, Package, Snowflake, Wrench } from "lucide-react";
import { toast } from "sonner";

interface Order {
  id: string;
  order_date: string;
  status: string;
  total_amount: number;
  product_name: string;
  // Address-based tracking fields
  order_type?: string;
  distance_km?: number;
  estimated_delivery?: string;
  tracking_progress?: number;
  // Customer address from profiles
  customer_address_street?: string;
  customer_address_city?: string;
  customer_address_state?: string;
  customer_address_postal_code?: string;
  customer_address_country?: string;
  // Supplier info
  supplier_location?: string;
  supplier_category?: string;
}

const CustomerOrders = () => {
  const { loading: authLoading, signOut, user: authUser } = useCustomerAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const user = authUser ? {
    name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
    email: authUser.email || '',
    avatar: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture
  } : undefined;

  useEffect(() => {
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
          product_name,
          order_type,
          distance_km,
          estimated_delivery,
          tracking_progress,
          customer:profiles!customer_id(
            address_street,
            address_city,
            address_state,
            address_postal_code,
            address_country
          ),
          supplier:suppliers(
            location,
            business_name
          )
        `)
        .eq("customer_id", user.id)
        .order("order_date", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
        // Log detailed error info
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        console.error("Error details:", error.details);
        toast.error(`Failed to load orders: ${error.message}`);
      } else {
        // Flatten nested data
        const ordersWithAddress = (data || []).map((order: any) => ({
          ...order,
          customer_address_street: order.customer?.address_street,
          customer_address_city: order.customer?.address_city,
          customer_address_state: order.customer?.address_state,
          customer_address_postal_code: order.customer?.address_postal_code,
          customer_address_country: order.customer?.address_country,
          supplier_location: order.supplier?.location,
          supplier_category: order.supplier?.business_name
        }));
        setOrders(ordersWithAddress);
      }
      setOrdersLoading(false);
    };

    fetchOrders();
    
    const handleOrdersUpdated = () => fetchOrders();
    const checkNewOrders = () => {
      const newOrders = localStorage.getItem('newly_created_orders');
      if (newOrders) {
        localStorage.removeItem('newly_created_orders');
        fetchOrders();
      }
    };    
    checkNewOrders();
    window.addEventListener('orders-updated', handleOrdersUpdated);
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'newly_created_orders' && e.newValue) {
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
      case "delivered":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      case "processing":
        return "bg-blue-500";
      case "in_transit":
        return "bg-orange-500";
      case "out_for_delivery":
        return "bg-pink-500";
      default:
        return "bg-gray-500";
    }
  };

  const getOrderTypeIcon = (orderType?: string) => {
    switch (orderType) {
      case 'perishable':
        return <Snowflake className="h-4 w-4 text-cyan-500" />;
      case 'service':
        return <Wrench className="h-4 w-4 text-purple-500" />;
      default:
        return <Package className="h-4 w-4 text-blue-500" />;
    }
  };

  const hasTrackingData = (order: Order) => {
    return order.customer_address_city || order.supplier_location;
  };

  const shouldShowTracking = (order: Order) => {
    return hasTrackingData(order) && 
           !['completed', 'delivered', 'cancelled'].includes(order.status);
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
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
              <Card key={order.id} className="overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getOrderTypeIcon(order.order_type)}
                        <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                        {order.distance_km && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {order.distance_km.toFixed(1)} km
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(order.order_date), { addSuffix: true })}
                      </p>
                      <p className="text-sm">{order.product_name}</p>
                      {order.customer_address_city && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Deliver to: {order.customer_address_city}
                          {order.customer_address_street && `, ${order.customer_address_street}`}
                        </p>
                      )}
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-2xl font-bold">R{Number(order.total_amount).toFixed(2)}</p>
                      {order.estimated_delivery && !['completed', 'delivered', 'cancelled'].includes(order.status) && (
                        <p className="text-xs text-muted-foreground">
                          Est. delivery: {new Date(order.estimated_delivery).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {shouldShowTracking(order) && (
                    <div className="mt-4 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleOrderExpansion(order.id)}
                        className="w-full"
                      >
                        {expandedOrder === order.id ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-2" />
                            Hide Tracking
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-2" />
                            Track Order
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {expandedOrder === order.id && shouldShowTracking(order) && (
                  <div className="border-t bg-muted/30 p-4">
                    <OrderTrackingTimeline
                      customerStreet={order.customer_address_street}
                      customerCity={order.customer_address_city}
                      customerState={order.customer_address_state}
                      customerPostalCode={order.customer_address_postal_code}
                      customerCountry={order.customer_address_country}
                      supplierLocation={order.supplier_location}
                      supplierCategory={order.supplier_category}
                      orderStatus={order.status}
                      orderDate={order.order_date}
                    />
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOrders;
