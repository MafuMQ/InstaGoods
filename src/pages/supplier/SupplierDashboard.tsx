import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSupplierAuth } from "@/hooks/useSupplierAuth";
import SupplierNav from "@/components/supplier/SupplierNav";
import { Card } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";

const SupplierDashboard = () => {
  const { loading, supplierId, signOut } = useSupplierAuth();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalExpenses: 0,
  });

  useEffect(() => {
    if (supplierId) {
      fetchDashboardStats();
    }
  }, [supplierId]);

  const fetchDashboardStats = async () => {
    if (!supplierId) return;

    const [ordersRes, productsRes, expensesRes, incomesRes] = await Promise.all([
      supabase
        .from("orders")
        .select("id")
        .eq("supplier_id", supplierId),
      supabase
        .from("products")
        .select("id")
        .eq("supplier_id", supplierId),
      supabase
        .from("expenses")
        .select("amount")
        .eq("supplier_id", supplierId),
      supabase
        .from("incomes")
        .select("amount")
        .eq("supplier_id", supplierId),
    ]);

    const totalRevenue = incomesRes.data?.reduce((sum, income) => sum + Number(income.amount), 0) || 0;
    const totalExpenses = expensesRes.data?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;

    setStats({
      totalRevenue,
      totalOrders: ordersRes.data?.length || 0,
      totalProducts: productsRes.data?.length || 0,
      totalExpenses,
    });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const netIncome = stats.totalRevenue - stats.totalExpenses;

  return (
    <div className="min-h-screen bg-background">
      <SupplierNav onSignOut={signOut} />
      
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8">Supplier Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="h-10 w-10 text-primary" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Income</p>
                <p className="text-3xl font-bold">${netIncome.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-primary" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-3xl font-bold">{stats.totalOrders}</p>
              </div>
              <ShoppingCart className="h-10 w-10 text-primary" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Products</p>
                <p className="text-3xl font-bold">{stats.totalProducts}</p>
              </div>
              <Package className="h-10 w-10 text-primary" />
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Financial Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b">
              <span className="text-muted-foreground">Total Revenue</span>
              <span className="font-semibold">${stats.totalRevenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="text-muted-foreground">Total Expenses</span>
              <span className="font-semibold text-destructive">-${stats.totalExpenses.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-3 pt-4 border-t-2">
              <span className="text-lg font-bold">Net Income</span>
              <span className="text-lg font-bold text-primary">${netIncome.toFixed(2)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SupplierDashboard;
