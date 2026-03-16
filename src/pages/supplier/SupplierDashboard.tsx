import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSupplierAuth } from "@/hooks/useSupplierAuth";
import SupplierNav from "@/components/supplier/SupplierNav";
import { Loading } from "@/components/ui/loading-spinner";
import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { useSupplierNav } from "@/contexts/SupplierNavContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {TrendingDown, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, AlertCircle, BarChart3 } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format, subDays, startOfDay, endOfDay, subMonths, startOfMonth, endOfMonth } from "date-fns";

interface TrendData {
  current: number;
  previous: number;
  percentage: number;
  direction: "up" | "down" | "neutral";
}

interface OrderData {
  id: string;
  product_name: string;
  total_amount: number;
  status: string;
  order_date: string;
}

interface ChartDataPoint {
  name: string;
  revenue: number;
  expenses: number;
}

const COLORS = ["#10b981", "#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6"];

const SupplierDashboard = () => {
  const { loading, supplierId, signOut, user: authUser } = useSupplierAuth();
  const [timePeriod, setTimePeriod] = useState("30");
  const { collapsed } = useSupplierNav();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalExpenses: 0,
  });
  const [trends, setTrends] = useState({
    revenue: { current: 0, previous: 0, percentage: 0, direction: "neutral" as "up" | "down" | "neutral" },
    orders: { current: 0, previous: 0, percentage: 0, direction: "neutral" as "up" | "down" | "neutral" },
    products: { current: 0, previous: 0, percentage: 0, direction: "neutral" as "up" | "down" | "neutral" },
    expenses: { current: 0, previous: 0, percentage: 0, direction: "neutral" as "up" | "down" | "neutral" },
  });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [recentOrders, setRecentOrders] = useState<OrderData[]>([]);
  const [orderStatusCounts, setOrderStatusCounts] = useState({
    pending: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
  });

  // Format user data for SupplierNav
  const user = authUser ? {
    name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
    email: authUser.email || '',
    avatar: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture
  } : undefined;

  const calculateTrend = (current: number, previous: number): TrendData => {
    if (previous === 0) {
      return { current, previous, percentage: current > 0 ? 100 : 0, direction: current > 0 ? "up" : "neutral" };
    }
    const percentage = ((current - previous) / previous) * 100;
    return {
      current,
      previous,
      percentage: Math.abs(percentage),
      direction: percentage > 0 ? "up" : percentage < 0 ? "down" : "neutral",
    };
  };

  useEffect(() => {
    if (supplierId) {
      fetchDashboardData();
    }
  }, [supplierId, timePeriod]);

  const fetchDashboardData = async () => {
    if (!supplierId) return;

    const days = parseInt(timePeriod);
    const previousDays = days * 2;
    
    const currentStart = subDays(new Date(), days);
    const previousStart = subDays(new Date(), previousDays);
    const previousEnd = subDays(new Date(), days);

    // Fetch current period data
    const [currentOrdersRes, currentProductsRes, currentExpensesRes, currentIncomesRes] = await Promise.all([
      supabase
        .from("orders")
        .select("id, total_amount, status, order_date, product_name")
        .eq("supplier_id", supplierId)
        .gte("order_date", currentStart.toISOString()),
      supabase
        .from("products")
        .select("id")
        .eq("supplier_id", supplierId),
      supabase
        .from("expenses")
        .select("amount, expense_date")
        .eq("supplier_id", supplierId)
        .gte("expense_date", currentStart.toISOString()),
      supabase
        .from("incomes")
        .select("amount, income_date")
        .eq("supplier_id", supplierId)
        .gte("income_date", currentStart.toISOString()),
    ]);

    // Fetch previous period data for trends
    const [prevOrdersRes, prevExpensesRes, prevIncomesRes] = await Promise.all([
      supabase
        .from("orders")
        .select("id, total_amount")
        .eq("supplier_id", supplierId)
        .gte("order_date", previousStart.toISOString())
        .lt("order_date", currentStart.toISOString()),
      supabase
        .from("expenses")
        .select("amount")
        .eq("supplier_id", supplierId)
        .gte("expense_date", previousStart.toISOString())
        .lt("expense_date", currentStart.toISOString()),
      supabase
        .from("incomes")
        .select("amount")
        .eq("supplier_id", supplierId)
        .gte("income_date", previousStart.toISOString())
        .lt("income_date", currentStart.toISOString()),
    ]);

    // Calculate current stats
    const currentRevenue = currentIncomesRes.data?.reduce((sum, income) => sum + Number(income.amount), 0) || 0;
    const currentExpenses = currentExpensesRes.data?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;

    // Calculate previous stats
    const prevRevenue = prevIncomesRes.data?.reduce((sum, income) => sum + Number(income.amount), 0) || 0;
    const prevExpenses = prevExpensesRes.data?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;
    const prevOrders = prevOrdersRes.data?.length || 0;

    setStats({
      totalRevenue: currentRevenue,
      totalOrders: currentOrdersRes.data?.length || 0,
      totalProducts: currentProductsRes.data?.length || 0,
      totalExpenses: currentExpenses,
    });

    // Calculate trends
    setTrends({
      revenue: calculateTrend(currentRevenue, prevRevenue),
      orders: calculateTrend(currentOrdersRes.data?.length || 0, prevOrders),
      products: calculateTrend(currentProductsRes.data?.length || 0, currentProductsRes.data?.length || 0),
      expenses: calculateTrend(currentExpenses, prevExpenses),
    });

    // Generate chart data
    const data: ChartDataPoint[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, "MMM dd");
      
      const dayIncomes = currentIncomesRes.data?.filter((inc) => {
        const incDate = new Date(inc.income_date);
        return format(incDate, "MMM dd") === dateStr;
      }) || [];
      
      const dayExpenses = currentExpensesRes.data?.filter((exp) => {
        const expDate = new Date(exp.expense_date);
        return format(expDate, "MMM dd") === dateStr;
      }) || [];

      data.push({
        name: dateStr,
        revenue: dayIncomes.reduce((sum, inc) => sum + Number(inc.amount), 0),
        expenses: dayExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0),
      });
    }
    setChartData(data);

    // Set recent orders
    const sortedOrders = (currentOrdersRes.data || [])
      .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())
      .slice(0, 5);
    setRecentOrders(sortedOrders);

    // Calculate order status counts
    const statusCounts = { pending: 0, processing: 0, completed: 0, cancelled: 0 };
    currentOrdersRes.data?.forEach((order) => {
      if (order.status in statusCounts) {
        statusCounts[order.status as keyof typeof statusCounts]++;
      }
    });
    setOrderStatusCounts(statusCounts);
  };

  const netIncome = stats.totalRevenue - stats.totalExpenses;
  const profitMargin = stats.totalRevenue > 0 ? ((netIncome / stats.totalRevenue) * 100) : 0;

  const orderStatusData = useMemo(() => {
    return [
      { name: "Pending", value: orderStatusCounts.pending, color: "#f59e0b" },
      { name: "Processing", value: orderStatusCounts.processing, color: "#3b82f6" },
      { name: "Completed", value: orderStatusCounts.completed, color: "#10b981" },
      { name: "Cancelled", value: orderStatusCounts.cancelled, color: "#ef4444" },
    ].filter(item => item.value > 0);
  }, [orderStatusCounts]);

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(142, 71%, 45%)",
    },
    expenses: {
      label: "Expenses",
      color: "hsl(0, 84%, 60%)",
    },
  };

  const TrendIndicator = ({ trend }: { trend: TrendData }) => {
    if (trend.direction === "neutral") {
      return <span className="text-muted-foreground text-sm">-</span>;
    }
    
    const isPositive = trend.direction === "up";
    return (
      <div className={`flex items-center gap-1 text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}>
        {isPositive ? (
          <ArrowUpRight className="h-4 w-4" />
        ) : (
          <ArrowDownRight className="h-4 w-4" />
        )}
        <span className="font-medium">{trend.percentage.toFixed(1)}%</span>
      </div>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "processing":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "cancelled":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SupplierNav onSignOut={signOut} supplierId={supplierId} user={user} />
        <div className="min-h-screen flex items-center justify-center">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SupplierNav onSignOut={signOut} supplierId={supplierId} user={user} />
      
      <div className={`mx-auto max-w-7xl py-4 md:py-8 px-4 transition-all duration-300 ${collapsed ? "lg:ml-16 lg:max-w-[calc(100vw-4rem)]" : "lg:ml-64 lg:max-w-[calc(100vw-16rem)]"}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
          <h1 className="text-2xl md:text-4xl font-bold">Supplier Dashboard</h1>
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Cards with Trends */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900/30">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <TrendIndicator trend={trends.revenue} />
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mb-1">Total Revenue</p>
            <p className="text-xl md:text-2xl font-bold">R{stats.totalRevenue.toFixed(2)}</p>
          </Card>

          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/30">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <TrendIndicator trend={trends.orders} />
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mb-1">Total Orders</p>
            <p className="text-xl md:text-2xl font-bold">{stats.totalOrders}</p>
          </Card>

          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-100 rounded-lg dark:bg-purple-900/30">
                <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <TrendIndicator trend={trends.products} />
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mb-1">Active Products</p>
            <p className="text-xl md:text-2xl font-bold">{stats.totalProducts}</p>
          </Card>

          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-red-100 rounded-lg dark:bg-red-900/30">
                <BarChart3 className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <TrendIndicator trend={trends.expenses} />
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mb-1">Total Expenses</p>
            <p className="text-xl md:text-2xl font-bold">R{stats.totalExpenses.toFixed(2)}</p>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Revenue vs Expenses Chart */}
          <Card className="lg:col-span-2 p-4 md:p-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg md:text-xl">Revenue vs Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }} 
                    className="text-muted-foreground"
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }} 
                    className="text-muted-foreground"
                    tickLine={false}
                    tickFormatter={(value) => `R${value}`}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value: number) => [`R${value.toFixed(2)}`]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorExpenses)"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Order Status Pie Chart */}
          <Card className="p-4 md:p-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg md:text-xl">Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              {orderStatusData.length > 0 ? (
                <div className="h-[250px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                  No orders in this period
                </div>
              )}
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {orderStatusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1 text-xs">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Summary and Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Financial Summary */}
          <Card className="p-4 md:p-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg md:text-xl">Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b">
                  <span className="text-sm md:text-base text-muted-foreground">Total Revenue</span>
                  <span className="text-sm md:text-base font-semibold text-green-600">R{stats.totalRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-3 border-b">
                  <span className="text-sm md:text-base text-muted-foreground">Total Expenses</span>
                  <span className="text-sm md:text-base font-semibold text-red-600">-R{stats.totalExpenses.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-3 border-b">
                  <span className="text-sm md:text-base text-muted-foreground">Net Income</span>
                  <span className="text-sm md:text-base font-bold text-primary">R{netIncome.toFixed(2)}</span>
                </div>
                
                {/* Profit Margin Progress */}
                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Profit Margin</span>
                    <span className={`font-medium ${profitMargin >= 20 ? 'text-green-600' : profitMargin >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {profitMargin.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(profitMargin, 100)} 
                    className="h-2"
                    style={{
                      background: profitMargin >= 20 ? '#10b981' : profitMargin >= 10 ? '#f59e0b' : '#ef4444'
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="p-4 md:p-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg md:text-xl">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(order.status)}
                        <div>
                          <p className="font-medium text-sm line-clamp-1">{order.product_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(order.order_date), "MMM dd, yyyy")}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-sm">R{order.total_amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No orders in this period
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;
