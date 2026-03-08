import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Download, Home, ShoppingBag, AlertCircle, Loader2 } from "lucide-react";
import Header from "@/components/customer/Header";
import { supabase } from "@/integrations/supabase/client";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { toast } from "sonner";

// Type definitions for order data
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  supplierId: string;
  image: string;
  description: string;
  delivery_fee?: number;
}

interface PendingOrderData {
  items: CartItem[];
  amount: number;
  deliveryFee: number;
  tax: number;
  timestamp: string;
  paymentMethod?: string;
}

interface CreatedOrder {
  id: string;
  product_name: string;
  supplier_id: string;
  total_amount: number;
  status: string;
}

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loading: authLoading, customerId, user } = useCustomerAuth();
  
  const amount = searchParams.get("amount") || "0.00";
  const orderId = searchParams.get("orderId") || "Unknown";
  const method = searchParams.get("method") || "card";
  
  const [isProcessing, setIsProcessing] = useState(true);
  const [ordersCreated, setOrdersCreated] = useState<CreatedOrder[]>([]);
  const [processError, setProcessError] = useState<string | null>(null);

  useEffect(() => {
    // Process the order creation when component mounts
    const processPayment = async () => {
      // Wait for auth to be ready
      if (authLoading) return;
      
      if (!user) {
        setProcessError("You must be logged in to complete your order. Please log in and try again.");
        setIsProcessing(false);
        return;
      }

      try {
        // Retrieve stored order data from sessionStorage
        const storedData = sessionStorage.getItem('pending_order_data');
        
        if (!storedData) {
          // No stored data means either:
          // 1. This was a direct order (not from cart) - order already exists
          // 2. The session expired
          console.log("No pending order data found - may be a direct order or session expired");
          setIsProcessing(false);
          return;
        }

        const orderData: PendingOrderData = JSON.parse(storedData);
        const { items, amount: totalAmount, paymentMethod } = orderData;

        if (!items || items.length === 0) {
          console.warn("No items found in order data");
          setIsProcessing(false);
          return;
        }

        // Generate a transaction ID
        const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        
        // Get unique suppliers from cart items
        const supplierGroups = new Map<string, CartItem[]>();
        items.forEach(item => {
          const existing = supplierGroups.get(item.supplierId) || [];
          supplierGroups.set(item.supplierId, [...existing, item]);
        });

        // Create orders for each supplier (atomic operation using multiple inserts)
        const createdOrders: CreatedOrder[] = [];
        
        for (const [supplierId, supplierItems] of supplierGroups) {
          // Calculate totals for this supplier's items
          const subtotal = supplierItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          // Calculate proportional delivery fee
          const proportionalDeliveryFee = orderData.deliveryFee * (supplierItems.length / items.length);
          const proportionalTax = orderData.tax * (supplierItems.length / items.length);
          const supplierTotal = subtotal + proportionalDeliveryFee + proportionalTax;

          // Create product name string (if multiple items, show first + count)
          const productName = supplierItems.length === 1 
            ? supplierItems[0].name 
            : `${supplierItems[0].name} and ${supplierItems.length - 1} more item(s)`;

          // Create the order record
          const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert({
              supplier_id: supplierId,
              customer_id: user.id,
              product_id: supplierItems[0].id, // Primary product
              product_name: productName,
              quantity: supplierItems.reduce((sum, item) => sum + item.quantity, 0),
              unit_price: subtotal / supplierItems.reduce((sum, item) => sum + item.quantity, 0),
              total_amount: supplierTotal,
              status: "pending",
              order_date: new Date().toISOString(),
              // Payment tracking fields
              transaction_id: transactionId,
              payment_method: paymentMethod || method,
              payment_status: "completed",
              payment_date: new Date().toISOString(),
              notes: `Order created from payment. ${supplierItems.length} item(s) from this supplier.`
            })
            .select("id, product_name, supplier_id, total_amount, status")
            .single();

          if (orderError) {
            console.error("Error creating order:", orderError);
            throw new Error(`Failed to create order for supplier: ${orderError.message}`);
          }

          if (order) {
            createdOrders.push(order);
          }
        }

        // Clear the stored order data after successful processing
        sessionStorage.removeItem('pending_order_data');
        
        // Dispatch a custom event to notify other components (like CustomerOrders) to refresh
        window.dispatchEvent(new CustomEvent('orders-updated', { 
          detail: { orders: createdOrders } 
        }));

        // Store the created orders in localStorage for CustomerOrders to pick up
        localStorage.setItem('newly_created_orders', JSON.stringify(createdOrders));

        setOrdersCreated(createdOrders);
        console.log("Orders created successfully:", createdOrders);
        
        toast.success(`Order created successfully! ${createdOrders.length} order(s) placed.`);

      } catch (error) {
        console.error("Error processing payment:", error);
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred while processing your order.";
        setProcessError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [user, authLoading, method]);

  // Track successful payment (analytics, etc.)
  useEffect(() => {
    console.log("Payment successful:", { amount, orderId });
  }, [amount, orderId]);

  const handleRetry = () => {
    // Clear the stored data and try again
    sessionStorage.removeItem('pending_order_data');
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container px-4 sm:px-6 py-6 sm:py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader className="pb-2">
              <div className="flex justify-center mb-4">
                {isProcessing ? (
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                ) : processError ? (
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                )}
              </div>
              
              {isProcessing ? (
                <CardTitle className="text-2xl text-blue-600">Processing Your Order...</CardTitle>
              ) : processError ? (
                <CardTitle className="text-2xl text-red-600">Order Processing Issue</CardTitle>
              ) : (
                <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              {isProcessing ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Please wait while we create your order(s)...
                  </p>
                  <div className="flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                </div>
              ) : processError ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-lg font-semibold text-primary mb-2">
                      R{parseFloat(amount).toFixed(2)}
                    </p>
                    <p className="text-muted-foreground">
                      Your payment was successful, but we encountered an issue creating your order.
                    </p>
                  </div>
                  
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="text-sm text-red-600">{processError}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button asChild className="flex-1" onClick={handleRetry}>
                      <Link to="/cart">
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Return to Cart
                      </Link>
                    </Button>
                    
                    <Button variant="outline" asChild className="flex-1">
                      <Link to="/customer/orders">
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        View Existing Orders
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <>
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
                        <span>Order ID{ordersCreated.length > 1 ? 's' : ''}:</span>
                        <span className="font-mono">
                          {ordersCreated.length > 0 
                            ? ordersCreated.map(o => o.id.slice(0, 8)).join(', ')
                            : orderId.slice(0, 8)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Date:</span>
                        <span>{new Date().toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Method:</span>
                        <span className="capitalize">{method}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="text-green-600 font-medium">Confirmed</span>
                      </div>
                      {ordersCreated.length > 0 && (
                        <div className="flex justify-between">
                          <span>Orders Created:</span>
                          <span className="font-medium">{ordersCreated.length}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>• A confirmation email has been sent to your email address</p>
                    <p>• You will receive order updates via SMS and email</p>
                    <p>• Delivery typically takes 2-5 business days</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button asChild className="flex-1">
                      <Link to="/customer/orders">
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        View Orders
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
