import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import CustomerNav from "@/components/customer/CustomerNav";
import { Loading } from "@/components/ui/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Heart, Package, DollarSign, ShoppingBag, ArrowRight, Star, Trophy, Gift, CreditCard, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { toast } from "sonner";
import {
  CustomerStats,
  CustomerTier,
  TIER_CONFIG,
  calculateTier,
  calculateTierProgress,
  getStatusColor,
  StoredCartItem
} from "@/types/orders";

// Local order type for dashboard (matches database)
interface OrderItem {
  id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: string | null;
  order_date: string | null;
  completed_date: string | null;
  supplier_id: string;
}

interface PaymentResult {
  success: boolean;
  orderId: string;
  orderIds: string[];
  amount: number;
  paymentMethod: string;
  items: StoredCartItem[];
  timestamp: string;
  loyaltyPointsEarned: number;
  newTier?: string;
  tierUpgraded?: boolean;
}

const CustomerDashboard = () => {
  const { loading: authLoading, customerId, signOut } = useCustomerAuth();
  const navigate = useNavigate();
  const { getCartTotal } = useCart();
  const { wishlistItems, getWishlistCount } = useWishlist();
  
  const [stats, setStats] = useState<CustomerStats>({
    totalOrders: 0,
    totalSpent: 0,
    wishlistItems: 0,
    cartValue: 0,
    loyaltyPoints: 0,
    availableCredits: 0,
    tier: 'bronze',
    tierProgress: 0,
    nextTierThreshold: 0,
    totalEarnedPoints: 0,
    pendingDeliveries: 0,
  });
  
  const [recentOrders, setRecentOrders] = useState<OrderItem[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [showNewOrderToast, setShowNewOrderToast] = useState(false);
  const [lastOrderIds, setLastOrderIds] = useState<string[]>([]);

  // Check for payment result and refresh data
  const checkPaymentResult = useCallback(() => {
    const paymentResultStr = localStorage.getItem('payment_result');
    if (paymentResultStr) {
      try {
        const paymentResult: PaymentResult = JSON.parse(paymentResultStr);
        if (paymentResult.success && paymentResult.orderIds.length > 0) {
          setLastOrderIds(paymentResult.orderIds);
          setShowNewOrderToast(true);
          
          // Show welcome back message with tier upgrade if applicable
          if (paymentResult.tierUpgraded && paymentResult.newTier) {
            toast.success(`🎉 Welcome back! You've been upgraded to ${paymentResult.newTier} tier!`);
          } else if (paymentResult.loyaltyPointsEarned > 0) {
            toast.success(`💫 You earned ${paymentResult.loyaltyPointsEarned} loyalty points from your last order!`);
          }
          
          // Clear the payment result after showing toast
          localStorage.removeItem('payment_result');
        }
      } catch (error) {
        console.error('Error parsing payment result:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (customerId) {
      checkPaymentResult();
      fetchDashboardStats();
      fetchOrderHistory();
    }
  }, [customerId, checkPaymentResult]);

  const fetchDashboardStats = async () => {
    if (!customerId) return;

    try {
      // Fetch all orders
      const { data: orders } = await supabase
        .from("orders")
        .select("id, total_amount, status, order_date")
        .eq("customer_id", customerId);

      // Get cart value from context
      const cartValue = getCartTotal();
      
      // Get wishlist count from context
      const wishlistCount = getWishlistCount();

      const totalSpent = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const totalOrders = orders?.length || 0;
      
      // Calculate tier
      const tier = calculateTier(totalSpent);
      const { progress: tierProgress, nextTier } = calculateTierProgress(totalSpent);
      
      // Calculate loyalty points (simplified - based on total spent)
      const totalEarnedPoints = Math.floor(totalSpent * TIER_CONFIG[tier].pointsPerRand);
      
      // Count pending deliveries
      const pendingDeliveries = orders?.filter(o => 
        o.status === 'completed' || o.status === 'processing' || o.status === 'shipped'
      ).length || 0;

      setStats({
        totalOrders,
        totalSpent,
        wishlistItems: wishlistCount,
        cartValue,
        loyaltyPoints: totalEarnedPoints - Math.floor(totalSpent * 0.1), // Simplified - assume 10% redeemed
        availableCredits: 0, // Could be fetched from a credits table
        tier,
        tierProgress,
        nextTierThreshold: nextTier ? TIER_CONFIG[nextTier].minSpend : 0,
        totalEarnedPoints,
        pendingDeliveries,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchOrderHistory = async () => {
    if (!customerId) return;
    
    setOrdersLoading(true);
    
    try {
      const { data: orders, error } = await supabase
        .from("orders")
        .select(`
          id,
          product_id,
          product_name,
          quantity,
          unit_price,
          total_amount,
          status,
          order_date,
          completed_date,
          supplier_id
        `)
        .eq("customer_id", customerId)
        .order("order_date", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Error fetching order history:", error);
      } else {
        setRecentOrders(orders || []);
      }
    } catch (error) {
      console.error("Error in fetchOrderHistory:", error);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Check if order is new (within last 5 minutes)
  const isNewOrder = (orderDate: string | null) => {
    if (!orderDate) return false;
    const orderTime = new Date(orderDate).getTime();
    const now = Date.now();
    return (now - orderTime) < 5 * 60 * 1000; // 5 minutes
  };

  // Get tier color
  const getTierColor = (tier: CustomerTier) => {
    return TIER_CONFIG[tier].color;
  };

  if (authLoading) {
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
        <h1 className="text-2xl md:text-4xl font-bold mb-6 md:mb-8">My Dashboard</h1>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total Orders</p>
                <p className="text-xl md:text-3xl font-bold">{stats.totalOrders}</p>
              </div>
              <ShoppingCart className="h-8 w-8 md:h-10 md:w-10 text-primary" />
            </div>
          </Card>

          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Wishlist Items</p>
                <p className="text-xl md:text-3xl font-bold">{stats.wishlistItems}</p>
              </div>
              <Heart className="h-8 w-8 md:h-10 md:w-10 text-primary" />
            </div>
          </Card>

          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Pending Deliveries</p>
                <p className="text-xl md:text-3xl font-bold">{stats.pendingDeliveries}</p>
              </div>
              <Package className="h-8 w-8 md:h-10 md:w-10 text-primary" />
            </div>
          </Card>

          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total Spent</p>
                <p className="text-xl md:text-3xl font-bold">R{stats.totalSpent.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 md:h-10 md:w-10 text-primary" />
            </div>
          </Card>
        </div>

        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 md:mb-8">
          {/* Enhanced Order History Section */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Recent Orders
                {showNewOrderToast && lastOrderIds.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full animate-pulse">
                    New!
                  </span>
                )}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/customer/orders')}>
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            
            {ordersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loading />
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.slice(0, 5).map((order) => {
                  const isNew = isNewOrder(order.order_date) || lastOrderIds.includes(order.id);
                  return (
                    <div 
                      key={order.id} 
                      className={`p-3 bg-muted rounded-lg ${isNew ? 'ring-2 ring-green-500 ring-opacity-50' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{order.product_name}</p>
                            {isNew && (
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(order.order_date)} • Qty: {order.quantity}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-semibold">R{Number(order.total_amount).toFixed(2)}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                            {order.status || 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No orders yet</p>
                <Button variant="link" onClick={() => navigate('/')}>
                  Start Shopping
                </Button>
              </div>
            )}
          </Card>

          {/* Wishlist Section */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Heart className="h-5 w-5" />
                My Wishlist
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/wishlist')}>
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            
            {wishlistItems.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {wishlistItems.slice(0, 6).map((item) => (
                  <div key={item.id} className="group relative">
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <p className="text-sm font-medium mt-2 truncate">{item.name}</p>
                    <p className="text-sm text-primary font-semibold">R{item.price}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Your wishlist is empty</p>
                <Button variant="link" onClick={() => navigate('/')}>
                  Browse Products
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => navigate('/')}
              >
                <ShoppingBag className="h-6 w-6" />
                <span className="text-sm">Shop Now</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => navigate('/cart')}
              >
                <ShoppingCart className="h-6 w-6" />
                <span className="text-sm">View Cart</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => navigate('/wishlist')}
              >
                <Heart className="h-6 w-6" />
                <span className="text-sm">Wishlist</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => navigate('/customer/orders')}
              >
                <Package className="h-6 w-6" />
                <span className="text-sm">My Orders</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
