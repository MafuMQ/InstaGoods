import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSupplierAuth } from "@/hooks/useSupplierAuth";
import SupplierNav from "@/components/supplier/SupplierNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface Income {
  id: string;
  source: string;
  amount: number;
  description: string;
  income_date: string;
  order_id: string | null;
  created_at: string;
}

interface Order {
  id: string;
  product_name: string;
  total_amount: number;
  status: string;
  order_date: string;
  hasIncome?: boolean;
}

const SupplierIncomes = () => {
  const { loading, supplierId, signOut } = useSupplierAuth();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    source: "",
    amount: "",
    description: "",
    income_date: format(new Date(), "yyyy-MM-dd"),
  });

  useEffect(() => {
    if (supplierId) {
      fetchIncomes();
      fetchOrders();
    }
  }, [supplierId]);

  const fetchIncomes = async () => {
    if (!supplierId) return;

    const { data, error } = await supabase
      .from("incomes")
      .select("*")
      .eq("supplier_id", supplierId)
      .order("income_date", { ascending: false });

    if (error) {
      toast.error("Error fetching incomes");
    } else {
      setIncomes(data || []);
    }
  };

  const fetchOrders = async () => {
    if (!supplierId) return;

    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .eq("supplier_id", supplierId)
      .eq("status", "completed")
      .order("order_date", { ascending: false });

    if (ordersError) {
      toast.error("Error fetching orders");
      return;
    }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) return;

    const { error } = await supabase
      .from("incomes")
      .insert({
        supplier_id: supplierId,
        source: formData.source,
        amount: parseFloat(formData.amount),
        description: formData.description,
        income_date: formData.income_date,
        order_id: null,
      });

    if (error) {
      toast.error("Error adding income");
    } else {
      toast.success("Income added successfully");
      setDialogOpen(false);
      fetchIncomes();
      resetForm();
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
      fetchIncomes();
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
      fetchIncomes();
      fetchOrders();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("incomes")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Error deleting income");
    } else {
      toast.success("Income deleted successfully");
      fetchIncomes();
      if (incomes.find(income => income.id === id)?.order_id) {
        fetchOrders(); // Refresh orders if we deleted an order-based income
      }
    }
  };

  const resetForm = () => {
    setFormData({
      source: "",
      amount: "",
      description: "",
      income_date: format(new Date(), "yyyy-MM-dd"),
    });
  };

  const totalIncomes = incomes.reduce((sum, income) => sum + Number(income.amount), 0);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <SupplierNav onSignOut={signOut} />
      
      <div className="container px-4 sm:px-6 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold mb-2">Incomes</h1>
            <p className="text-xl sm:text-2xl text-muted-foreground">Total: ${totalIncomes.toFixed(2)}</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Income
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Income</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="source">Source</Label>
                  <Input
                    id="source"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    placeholder="e.g., Sales, Services, Consultation"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount (R)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="income_date">Date</Label>
                  <Input
                    id="income_date"
                    type="date"
                    value={formData.income_date}
                    onChange={(e) => setFormData({ ...formData, income_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Add Income
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Completed Orders Section */}
        {orders.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Completed Orders</h2>
            <p className="text-muted-foreground mb-4">
              You can add completed orders to your income records. Orders can only be added once.
            </p>
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="p-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                      <h3 className="font-semibold">{order.product_name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{format(new Date(order.order_date), "PPP")}</span>
                        <Badge variant="secondary">{order.status}</Badge>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <span className="text-lg font-bold text-primary">
                        ${order.total_amount.toFixed(2)}
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
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Income Records Section */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Income Records</h2>
          <div className="space-y-4">
            {incomes.map((income) => (
              <Card key={income.id} className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold">{income.source}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(income.income_date), "PPP")}
                        </p>
                        {income.order_id && (
                          <Badge variant="outline" className="mt-1">
                            From Order
                          </Badge>
                        )}
                      </div>
                      <p className="text-xl sm:text-2xl font-bold text-primary">
                        ${income.amount.toFixed(2)}
                      </p>
                    </div>
                    {income.description && (
                      <p className="text-muted-foreground mt-2">{income.description}</p>
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(income.id)}
                    className="ml-4"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {incomes.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No income records yet. Add your first income to start tracking.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierIncomes;