import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSupplierAuth } from "@/hooks/useSupplierAuth";
import SupplierNav from "@/components/supplier/SupplierNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";

interface Order {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: string;
  order_date: string;
  notes: string;
}

const SupplierOrders = () => {
  const { loading, supplierId, signOut } = useSupplierAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (supplierId) {
      fetchOrders();
    }
  }, [supplierId]);

  const fetchOrders = async () => {
    if (!supplierId) return;

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("supplier_id", supplierId)
      .order("order_date", { ascending: false });

    if (error) {
      toast.error("Error fetching orders");
    } else {
      setOrders(data || []);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ 
        status: newStatus,
        completed_date: newStatus === "completed" ? new Date().toISOString() : null
      })
      .eq("id", orderId);

    if (error) {
      toast.error("Error updating order status");
    } else {
      toast.success("Order status updated");
      fetchOrders();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "processing":
        return "bg-blue-500";
      case "completed":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <SupplierNav onSignOut={signOut} />
      
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8">Orders</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">{order.product_name}</h3>
                  <p className="text-muted-foreground text-sm">
                    {format(new Date(order.order_date), "PPP")}
                  </p>
                </div>
                <Badge className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="font-semibold">{order.quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Unit Price</p>
                  <p className="font-semibold">${order.unit_price}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="font-semibold text-primary">${order.total_amount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Update Status</p>
                  <Select
                    value={order.status}
                    onValueChange={(value) => updateOrderStatus(order.id, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {order.notes && (
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground mb-1">Notes:</p>
                  <p className="text-sm">{order.notes}</p>
                </div>
              )}
            </Card>
          ))}
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No orders yet. Orders will appear here when customers make purchases.
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierOrders;
