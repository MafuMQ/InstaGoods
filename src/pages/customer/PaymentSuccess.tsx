import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Download, Home, ShoppingBag, Star, Gift, Trophy, Package, Sparkles } from "lucide-react";
import Header from "@/components/customer/Header";
import { Loading } from "@/components/ui/loading-spinner";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { StoredCartItem, TIER_CONFIG, calculateTier, calculateLoyaltyPoints } from "@/types/orders";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const amount = searchParams.get("amount") || "0.00";
  const orderId = searchParams.get("orderId") || "Unknown";
  const method = searchParams.get("method") || "card";
  const { clearCart, getCartTotal } = useCart();
  const [isLoading, setIsLoading] = useState(true);
  const [orderSaved, setOrderSaved] = useState(false);
  const [loyaltyPointsEarned, setLoyaltyPointsEarned] = useState(0);
  const [newTier, setNewTier] = useState<string | null>(null);
  const [purchasedItems, setPurchasedItems] = useState<StoredCartItem[]>([]);
  const [orderIds, setOrderIds] = useState<string[]>([]);

  useEffect(() => {
    // Save orders to database after successful payment
    const saveOrdersToDatabase = async () => {
      // Only save if we haven't already
      if (orderSaved) return;
      
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          // If no user session, try to get stored cart items
          const storedCart = localStorage.getItem('checkout_cart');
          if (storedCart) {
            const cartItems: StoredCartItem[] = JSON.parse(storedCart);
            await saveOrdersWithoutUser(cartItems);
          }
          setIsLoading(false);
          return;
        }

        // Get cart items - from localStorage or current cart
        let cartItems: StoredCartItem[] = [];
        const storedCart = localStorage.getItem('checkout_cart');
        
        if (storedCart) {
          cartItems = JSON.parse(storedCart);
        } else {
          // Fallback to current cart context (for backward compatibility)
          const currentCart = localStorage.getItem('cart');
          if (currentCart) {
            cartItems = JSON.parse(currentCart);
          }
        }

        setPurchasedItems(cartItems);

        if (cartItems.length > 0) {
          // First, get supplier IDs for all products
          const productIds = cartItems.map(item => item.id);
          const { data: products } = await supabase
            .from('products')
            .select('id, supplier_id')
            .in('id', productIds);

          // Create a map of product ID to supplier ID
          const productSupplierMap = new Map();
          (products || []).forEach(p => {
            productSupplierMap.set(p.id, p.supplier_id);
          });

          // Calculate estimated delivery dates for each item
          const now = new Date();
          const estimatedDelivery = new Date(now);
          estimatedDelivery.setDate(estimatedDelivery.getDate() + 5); // 5 days from now

          // Save each item as an order
          const ordersToInsert = cartItems.map((item) => ({
            customer_id: session.user.id,
            product_id: item.id,
            product_name: item.name,
            quantity: item.quantity,
            unit_price: item.price,
            total_amount: item.price * item.quantity,
            supplier_id: productSupplierMap.get(item.id) || item.supplierId,
            status: 'completed',
            order_date: now.toISOString(),
            completed_date: now.toISOString(),
            estimated_delivery: estimatedDelivery.toISOString(),
          }));

          const { data: orderData, error } = await supabase
            .from('orders')
            .insert(ordersToInsert)
            .select('id');

          if (error) {
            console.error('Error saving orders:', error);
            toast.error('Failed to save order details. Please contact support.');
          } else {
            // Get the inserted order IDs
            const insertedIds = orderData?.map(o => o.id) || [];
            setOrderIds(insertedIds);

            // Calculate current tier and loyalty points
            const { data: existingOrders } = await supabase
              .from('orders')
              .select('total_amount')
              .eq('customer_id', session.user.id);

            const currentTotalSpent = (existingOrders || []).reduce(
              (sum, o) => sum + Number(o.total_amount), 0
            );
            
            // Calculate points for this purchase (using current tier)
            const currentTier = calculateTier(currentTotalSpent - (parseFloat(amount) || 0));
            const pointsEarned = calculateLoyaltyPoints(parseFloat(amount), currentTier);
            setLoyaltyPointsEarned(pointsEarned);

            // Calculate new tier after this purchase
            const newTierResult = calculateTier(currentTotalSpent);
            const newTierName = TIER_CONFIG[newTierResult].name;
            
            if (newTierResult !== currentTier) {
              setNewTier(newTierName);
            }

            // Store payment result in localStorage for dashboard refresh
            const paymentResult = {
              success: true,
              orderId: orderId,
              orderIds: insertedIds,
              amount: parseFloat(amount),
              paymentMethod: method,
              items: cartItems,
              timestamp: now.toISOString(),
              loyaltyPointsEarned: pointsEarned,
              newTier: newTierName,
              tierUpgraded: newTierResult !== currentTier
            };
            localStorage.setItem('payment_result', JSON.stringify(paymentResult));

            // Update inventory for each product (decrease stock)
            await updateInventory(cartItems);

            setOrderSaved(true);
            // Clear the checkout cart and localStorage
            localStorage.removeItem('checkout_cart');
            clearCart();
            toast.success(`Order saved! You earned ${pointsEarned} loyalty points!`);
          }
        }
      } catch (error) {
        console.error('Error in saveOrdersToDatabase:', error);
      } finally {
        setIsLoading(false);
      }
    };

    saveOrdersToDatabase();
  }, [orderSaved, clearCart]);

  // Helper function to save orders without user (guest checkout)
  const saveOrdersWithoutUser = async (cartItems: StoredCartItem[]) => {
    // For guest checkout, we would need a different approach
    // For now, just log that guest checkout orders aren't saved
    console.log('Guest checkout - orders not saved to database');
    // Clear cart for guest checkout too
    clearCart();
    localStorage.removeItem('checkout_cart');
  };

  // Update inventory after purchase
  const updateInventory = async (cartItems: StoredCartItem[]) => {
    for (const item of cartItems) {
      try {
        // Get current stock
        const { data: product } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', item.id)
          .single();

        if (product) {
          const newStock = Math.max(0, (product.stock_quantity || 0) - item.quantity);
          await supabase
            .from('products')
            .update({ stock_quantity: newStock })
            .eq('id', item.id);
        }
      } catch (error) {
        console.error('Error updating inventory for item:', item.id, error);
      }
    }
  };

  useEffect(() => {
    // Track successful payment (analytics, etc.)
    console.log("Payment successful:", { amount, orderId });
  }, [amount, orderId]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container px-4 sm:px-6 py-6 sm:py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader className="pb-2">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loading message="Saving your order..." />
                </div>
              ) : (
                <>
                  {/* Loyalty Points & Rewards Earned */}
                  {loyaltyPointsEarned > 0 && (
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 p-4 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                          <Star className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-amber-800">
                            You earned {loyaltyPointsEarned} Loyalty Points!
                          </p>
                          {newTier && (
                            <p className="text-sm text-amber-700 flex items-center gap-1">
                              <Trophy className="w-3 h-3" />
                              Welcome to {newTier} Tier!
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-amber-600">
                        Use these points on your next purchase to get discounts!
                      </p>
                    </div>
                  )}

                  {/* Tier Upgrade Banner */}
                  {newTier && (
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 p-4 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-purple-800">
                            🎉 Congratulations! You've been upgraded to {newTier}!
                          </p>
                          <p className="text-sm text-purple-700">
                            Enjoy exclusive {newTier} benefits and earn more points per purchase!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-lg font-semibold text-primary mb-2">
                      R{parseFloat(amount).toFixed(2)}
                    </p>
                    <p className="text-muted-foreground">
                      Your {method === "bitcoin" || method === "ethereum" ? "crypto " : ""}payment has been processed successfully
                    </p>
                    {(method === "bitcoin" || method === "ethereum") && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Crypto payment verified and confirmed
                      </p>
                    )}
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Order ID:</span>
                        <span className="font-mono">{orderId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Date:</span>
                        <span>{new Date().toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="text-green-600 font-medium">Confirmed</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Summary */}
                  {purchasedItems.length > 0 && (
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Items Purchased ({purchasedItems.length})
                      </h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {purchasedItems.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="truncate flex-1">{item.name} x{item.quantity}</span>
                            <span className="ml-2">R{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>• A confirmation email has been sent to your email address</p>
                    <p>• You will receive order updates via SMS and email</p>
                    <p>• Delivery typically takes 2-5 business days</p>
                    {loyaltyPointsEarned > 0 && (
                      <p className="text-amber-600 font-medium">• {loyaltyPointsEarned} loyalty points have been added to your account</p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      asChild 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        // Clear payment result after navigating
                        localStorage.removeItem('payment_result');
                      }}
                    >
                      <Link to="/customer/dashboard">
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        View My Orders
                      </Link>
                    </Button>

                    <Button variant="outline" asChild className="flex-1">
                      <Link to="/">
                        <Home className="w-4 h-4 mr-2" />
                        Continue Shopping
                      </Link>
                    </Button>
                  </div>

                  <div className="pt-4 border-t">
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <Download className="w-4 h-4 mr-2" />
                      Download Receipt
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;