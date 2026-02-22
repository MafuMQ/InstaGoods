import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import CustomerNav from "@/components/customer/CustomerNav";
import { Loading } from "@/components/ui/loading-spinner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Clock, ChevronDown, ChevronUp, FileText, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface Order {
  id: string;
  order_date: string;
  completed_date: string | null;
  status: string;
  total_amount: number;
  product_name: string;
  product_id: string | null;
  quantity: number;
  unit_price: number;
  supplier_id: string;
  notes: string | null;
}

const CustomerOrders = () => {
  const { loading, customerId, signOut } = useCustomerAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Check for new orders from payment
  const checkNewOrders = useCallback(() => {
    const paymentResultStr = localStorage.getItem('payment_result');
    if (paymentResultStr) {
      try {
        const paymentResult = JSON.parse(paymentResultStr);
        if (paymentResult.success) {
          toast.success('New order placed successfully!');
          localStorage.removeItem('payment_result');
          fetchOrders();
        }
      } catch (error) {
        console.error('Error checking payment result:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (customerId) {
      fetchOrders();
      checkNewOrders();
    }
  }, [customerId, checkNewOrders]);

  const fetchOrders = async () => {
    if (!customerId) return;

    setOrdersLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        order_date,
        completed_date,
        status,
        total_amount,
        product_name,
        product_id,
        quantity,
        unit_price,
        supplier_id,
        notes
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

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const formatOrderDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
              <Card key={order.id} className="overflow-hidden">
                <div 
                  className="p-4 sm:p-6 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleOrderExpand(order.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(order.order_date), { addSuffix: true })}
                      </p>
                      <p className="text-sm font-medium">{order.product_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Quantity: {order.quantity} × R{Number(order.unit_price).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-left sm:text-right">
                        <p className="text-2xl font-bold">R{Number(order.total_amount).toFixed(2)}</p>
                      </div>
                      {expandedOrder === order.id ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Expanded Details */}
                {expandedOrder === order.id && (
                  <div className="border-t bg-muted/30 p-4 sm:p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Order Details */}
                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Order Details
                        </h4>
                        <div className="text-sm space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Order ID:</span>
                            <span className="font-mono text-xs">{order.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Order Date:</span>
                            <span>{formatOrderDate(order.order_date)}</span>
                          </div>
                          {order.completed_date && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Completed:</span>
                              <span>{formatOrderDate(order.completed_date)}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Quantity:</span>
                            <span>{order.quantity}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Unit Price:</span>
                            <span>R{Number(order.unit_price).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Product & Status */}
                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          Product Information
                        </h4>
                        <div className="text-sm space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Product:</span>
                            <span className="font-medium">{order.product_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Amount:</span>
                            <span className="font-bold text-primary">R{Number(order.total_amount).toFixed(2)}</span>
                          </div>
                          {order.notes && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Notes:</span>
                              <span>{order.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-2" />
                        View Receipt
                      </Button>
                      <Button variant="outline" size="sm">
                        <Package className="w-4 h-4 mr-2" />
                        Track Order
                      </Button>
                    </div>
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
