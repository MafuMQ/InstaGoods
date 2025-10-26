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
import { DollarSign } from "lucide-react";

interface Order {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: string;
  order_date: string;
  notes: string;
  hasIncome?: boolean;
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

    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .eq("supplier_id", supplierId)
      .order("order_date", { ascending: false });

    if (ordersError) {
      toast.error("Error fetching orders");
      return;
    }

    // Check which orders already have income records
    const { data: incomesData, error: incomesError } = await supabase
      .from("incomes")
      .select("order_id")
      .eq("supplier_id", supplierId)
      .not("order_id", "is", null);

    if (incomesError) {
      toast.error("Error fetching income records");
      return;
    }

    const orderIdsWithIncomes = new Set(incomesData?.map(income => income.order_id) || []);
    
    const ordersWithIncomeStatus = ordersData?.map(order => ({
      ...order,
      hasIncome: orderIdsWithIncomes.has(order.id)
    })) || [];

    setOrders(ordersWithIncomeStatus);
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

  const handleAddOrderToIncomes = async (order: Order) => {
    if (!supplierId) return;

    const { error } = await supabase
      .from("incomes")
      .insert({
        supplier_id: supplierId,
        source: `Order: ${order.product_name}`,
        amount: order.total_amount,
        description: `Income from completed order #${order.id.slice(0, 8)}`,
        income_date: format(new Date(), "yyyy-MM-dd"),
        order_id: order.id,
      });

    if (error) {
      toast.error("Error adding order to incomes");
    } else {
      toast.success("Order added to incomes");
      fetchOrders();
    }
  };

  const handleRemoveOrderFromIncomes = async (orderId: string) => {
    const { error } = await supabase
      .from("incomes")
      .delete()
      .eq("order_id", orderId);

    if (error) {
      toast.error("Error removing order from incomes");
    } else {
      toast.success("Order removed from incomes");
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

              {order.status === "completed" && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Income Tracking:
                    </span>
                    {order.hasIncome ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveOrderFromIncomes(order.id)}
                      >
                        Remove from Incomes
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleAddOrderToIncomes(order)}
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Add to Incomes
                      </Button>
                    )}
                  </div>
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
