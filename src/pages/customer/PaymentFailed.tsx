import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, RefreshCw, Home, HelpCircle } from "lucide-react";
import Header from "@/components/customer/Header";

const PaymentFailed = () => {
  const [searchParams] = useSearchParams();
  const amount = searchParams.get("amount") || "0.00";
  const error = searchParams.get("error") || "Unknown error";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container px-4 sm:px-6 py-6 sm:py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader className="pb-2">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-red-600">Payment Failed</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <p className="text-lg font-semibold text-muted-foreground mb-2">
                  R{parseFloat(amount).toFixed(2)}
                </p>
                <p className="text-muted-foreground">
                  We couldn't process your payment
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span>R{parseFloat(amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Attempt Date:</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-red-600 font-medium">Failed</span>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <h4 className="font-medium text-red-800 mb-1">What happened?</h4>
                    <p className="text-sm text-red-700">
                      {error === "card_declined" && "Your card was declined. Please check with your bank or try a different card."}
                      {error === "insufficient_funds" && "Insufficient funds in your account. Please add funds or try a different payment method."}
                      {error === "expired_card" && "Your card has expired. Please use a different card."}
                      {error === "invalid_card" && "Invalid card details. Please check your card information and try again."}
                      {error === "network_error" && "Network error occurred. Please check your connection and try again."}
                      {!["card_declined", "insufficient_funds", "expired_card", "invalid_card", "network_error"].includes(error) &&
                        "An unexpected error occurred. Please try again or contact support if the problem persists."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-sm text-muted-foreground space-y-2">
                <p>• Your card was not charged</p>
                <p>• Your order has not been placed</p>
                <p>• Your cart items are preserved and safe</p>
                <p>• You can safely try again</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild className="flex-1">
                  <Link to="/cart">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Link>
                </Button>

                <Button variant="outline" asChild className="flex-1">
                  <Link to="/">
                    <Home className="w-4 h-4 mr-2" />
                    Back to Home
                  </Link>
                </Button>
              </div>

              <div className="pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  <p>Need help? <Link to="/contact" className="text-primary hover:underline">Contact Support</Link></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;