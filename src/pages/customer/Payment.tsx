import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/customer/Header";
import PaymentMethodSelector, { PaymentMethod } from "@/components/customer/PaymentMethodSelector";
import PaymentForm, { PaymentData } from "@/components/customer/PaymentForm";
import CryptoPaymentForm from "@/components/customer/CryptoPaymentForm";
import PaymentSummary from "@/components/customer/PaymentSummary";
import { ArrowLeft, Check } from "lucide-react";

const Payment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { toast } = useToast();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("card");
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'method' | 'details' | 'confirm'>('method');

  const steps = [
    { id: 'method', title: 'Payment Method', description: 'Choose how to pay' },
    { id: 'details', title: 'Payment Details', description: 'Enter payment information' },
    { id: 'confirm', title: 'Confirm & Pay', description: 'Review and complete payment' },
  ];

  // Get order details from URL params or cart
  const orderId = searchParams.get("orderId");
  const amount = parseFloat(searchParams.get("amount") || getCartTotal().toString());

  // Calculate fees
  const subtotal = amount;
  const deliveryFee = subtotal > 500 ? 0 : 50; // Free delivery over R500
  const tax = subtotal * 0.15; // 15% VAT
  const total = subtotal + deliveryFee + tax;

  const handleNextStep = () => {
    if (currentStep === 'method') {
      setCurrentStep('details');
    } else if (currentStep === 'details') {
      setCurrentStep('confirm');
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 'details') {
      setCurrentStep('method');
    } else if (currentStep === 'confirm') {
      setCurrentStep('details');
    }
  };

  const canProceedToNext = () => {
    if (currentStep === 'method') {
      return selectedMethod !== null;
    }
    return true;
  };

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progressValue = ((currentStepIndex + 1) / steps.length) * 100;

  const handleCardPaymentSubmit = async (paymentData: PaymentData) => {
    setLoading(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock payment success/failure (90% success rate)
      const success = Math.random() > 0.1;

      if (success) {
        // Clear cart only if payment was from cart AND payment was successful
        if (!orderId) {
          clearCart();
        }

        // Redirect to success page
        navigate(`/payment/success?amount=${total.toFixed(2)}&orderId=${orderId || 'cart-' + Date.now()}`);
      } else {
        // Cart is NOT cleared on payment failure - user keeps their items
        toast({
          title: "Payment Failed",
          description: "Your payment was declined. Your cart items are preserved.",
          variant: "destructive",
        });
        // Cart is NOT cleared on failed payment - user keeps their items
        navigate(`/payment/failed?amount=${total.toFixed(2)}`);
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCryptoPaymentSubmit = async (transactionHash: string) => {
    setLoading(true);

    try {
      // Simulate crypto payment verification
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock verification success/failure (85% success rate for crypto)
      const success = Math.random() > 0.15;

      if (success) {
        // Clear cart if payment was from cart
        if (!orderId) {
          clearCart();
        }

        // Redirect to success page
        navigate(`/payment/success?amount=${total.toFixed(2)}&orderId=${orderId || 'cart-' + Date.now()}&method=${selectedMethod}`);
      } else {
        // Cart is NOT cleared on crypto verification failure - user keeps their items
        toast({
          title: "Crypto Payment Failed",
          description: "Crypto payment verification failed. Your cart items are preserved.",
          variant: "destructive",
        });
        // Cart is NOT cleared on failed crypto payment - user keeps their items
        navigate(`/payment/failed?amount=${total.toFixed(2)}&error=crypto_verification_failed`);
      }
    } catch (error) {
      toast({
        title: "Verification Error",
        description: "Failed to verify crypto payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Redirect if no items to pay for
  if (cartItems.length === 0 && !orderId) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container px-4 sm:px-6 py-6 sm:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6 sm:mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => currentStep === 'method' ? navigate(-1) : handlePrevStep()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {currentStep === 'method' ? 'Back' : 'Previous'}
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold">Secure Checkout</h1>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    index <= currentStepIndex
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {index < currentStepIndex ? <Check className="h-4 w-4" /> : index + 1}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <div className={`text-sm font-medium ${
                      index <= currentStepIndex ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-muted-foreground">{step.description}</div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-4 ${
                      index < currentStepIndex ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Main Content Section */}
            <div className="lg:col-span-2 space-y-6">
              {currentStep === 'method' && (
                <>
                  <PaymentMethodSelector
                    selectedMethod={selectedMethod}
                    onMethodChange={setSelectedMethod}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleNextStep}
                      disabled={!canProceedToNext()}
                      className="px-8"
                    >
                      Continue to Payment Details
                    </Button>
                  </div>
                </>
              )}

              {currentStep === 'details' && (
                <>
                  {/* Payment Form */}
                  {selectedMethod === "card" && (
                    <PaymentForm
                      amount={total}
                      onSubmit={handleCardPaymentSubmit}
                      loading={loading}
                    />
                  )}

                  {(selectedMethod === "bitcoin" || selectedMethod === "ethereum") && (
                    <CryptoPaymentForm
                      amount={total}
                      currency={selectedMethod as "bitcoin" | "ethereum"}
                      onSubmit={handleCryptoPaymentSubmit}
                      loading={loading}
                    />
                  )}

                  {selectedMethod === "mobile" && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Mobile payment integration coming soon...</p>
                    </div>
                  )}

                  {selectedMethod === "bank" && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Bank transfer integration coming soon...</p>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={handlePrevStep}>
                      Back to Payment Method
                    </Button>
                    <Button
                      onClick={handleNextStep}
                      className="px-8"
                    >
                      Review Order
                    </Button>
                  </div>
                </>
              )}

              {currentStep === 'confirm' && (
                <>
                  <div className="text-center space-y-4">
                    <h2 className="text-xl font-semibold">Review Your Order</h2>
                    <p className="text-muted-foreground">
                      Please review your order details and payment method before confirming.
                    </p>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Payment Method</h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      {selectedMethod === 'card' && 'Credit/Debit Card'}
                      {selectedMethod === 'bitcoin' && 'Bitcoin (BTC)'}
                      {selectedMethod === 'ethereum' && 'Ethereum (ETH)'}
                      {selectedMethod === 'mobile' && 'Mobile Money'}
                      {selectedMethod === 'bank' && 'Bank Transfer'}
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={handlePrevStep}>
                      Back to Payment Details
                    </Button>
                    <Button
                      onClick={() => {
                        if (selectedMethod === "card") {
                          // Trigger form submission
                          const form = document.querySelector('form');
                          form?.requestSubmit();
                        } else if (selectedMethod === "bitcoin" || selectedMethod === "ethereum") {
                          // For crypto, we'd need to trigger the crypto form
                          // For now, just show a message
                          toast({
                            title: "Payment Processing",
                            description: "Please complete the payment in the previous step.",
                          });
                        }
                      }}
                      disabled={loading}
                      className="px-8"
                    >
                      {loading ? "Processing..." : `Pay R${total.toFixed(2)}`}
                    </Button>
                  </div>
                </>
              )}
            </div>

            {/* Order Summary Section */}
            <div className="lg:col-span-1">
              <PaymentSummary
                items={cartItems}
                subtotal={subtotal}
                deliveryFee={deliveryFee}
                tax={tax}
                total={total}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
