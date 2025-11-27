import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Download, Home, ShoppingBag } from "lucide-react";
import Header from "@/components/customer/Header";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const amount = searchParams.get("amount") || "0.00";
  const orderId = searchParams.get("orderId") || "Unknown";
  const method = searchParams.get("method") || "card";

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

              <div className="text-sm text-muted-foreground space-y-2">
                <p>• A confirmation email has been sent to your email address</p>
                <p>• You will receive order updates via SMS and email</p>
                <p>• Delivery typically takes 2-5 business days</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild className="flex-1">
                  <Link to="/orders">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;