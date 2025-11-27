import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSupplierAuth } from "@/hooks/useSupplierAuth";
import SupplierNav from "@/components/supplier/SupplierNav";
import { Loading } from "@/components/ui/loading-spinner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  expense_date: string;
  created_at: string;
}

const SupplierExpenses = () => {
  const { loading, supplierId, signOut } = useSupplierAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    description: "",
    expense_date: format(new Date(), "yyyy-MM-dd"),
  });

  useEffect(() => {
    if (supplierId) {
      fetchExpenses();
    }
  }, [supplierId]);

  const fetchExpenses = async () => {
    if (!supplierId) return;

    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("supplier_id", supplierId)
      .order("expense_date", { ascending: false });

    if (error) {
      toast.error("Error fetching expenses");
    } else {
      setExpenses(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) return;

    const { error } = await supabase
      .from("expenses")
      .insert({
        supplier_id: supplierId,
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description,
        expense_date: formData.expense_date,
      });

    if (error) {
      toast.error("Error adding expense");
    } else {
      toast.success("Expense added successfully");
      setDialogOpen(false);
      fetchExpenses();
      resetForm();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Error deleting expense");
    } else {
      toast.success("Expense deleted successfully");
      fetchExpenses();
    }
  };

  const resetForm = () => {
    setFormData({
      category: "",
      amount: "",
      description: "",
      expense_date: format(new Date(), "yyyy-MM-dd"),
    });
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SupplierNav onSignOut={signOut} />
        <div className="min-h-screen flex items-center justify-center">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SupplierNav onSignOut={signOut} />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-8 lg:ml-64 lg:max-w-[calc(100vw-16rem)]">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold mb-2">Expenses</h1>
            <p className="text-xl sm:text-2xl text-muted-foreground">Total: R{totalExpenses.toFixed(2)}</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Materials, Shipping, Marketing"
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
                  <Label htmlFor="expense_date">Date</Label>
                  <Input
                    id="expense_date"
                    type="date"
                    value={formData.expense_date}
                    onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
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
                  Add Expense
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {expenses.map((expense) => (
            <Card key={expense.id} className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold">{expense.category}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(expense.expense_date), "PPP")}
                      </p>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-destructive">
                      R{expense.amount}
                    </p>
                  </div>
                  {expense.description && (
                    <p className="text-muted-foreground mt-2">{expense.description}</p>
                  )}
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(expense.id)}
                  className="ml-4"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {expenses.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No expenses recorded yet. Add your first expense to start tracking.
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierExpenses;
