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
  const { loading, customerId, signOut } = useCustomerAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (customerId) {
      fetchOrders();
    }
  }, [customerId]);

  const fetchOrders = async () => {
    if (!customerId) return;

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
      .eq("customer_id", customerId)
      .order("order_date", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
    } else {
      setOrders(data || []);
    }
    setOrdersLoading(false);
  };

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
