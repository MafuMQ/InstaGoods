import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, Lock, CheckCircle, AlertCircle, Shield, Zap } from "lucide-react";

interface PaymentFormProps {
  amount: number;
  onSubmit: (paymentData: PaymentData) => void;
  loading?: boolean;
}

export interface PaymentData {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
  email: string;
}

const PaymentForm = ({ amount, onSubmit, loading = false }: PaymentFormProps) => {
  const [formData, setFormData] = useState<PaymentData>({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    cardholderName: "",
    email: "",
  });

  const [errors, setErrors] = useState<Partial<PaymentData>>({});
  const [cardType, setCardType] = useState<'visa' | 'mastercard' | 'amex' | null>(null);
  const [fieldValidation, setFieldValidation] = useState<Record<keyof PaymentData, boolean>>({
    cardNumber: false,
    expiryMonth: false,
    expiryYear: false,
    cvv: false,
    cardholderName: false,
    email: false,
  });

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const detectCardType = (number: string): 'visa' | 'mastercard' | 'amex' | null => {
    const cleanNumber = number.replace(/\s/g, '');
    if (cleanNumber.startsWith('4')) return 'visa';
    if (cleanNumber.startsWith('5') || cleanNumber.startsWith('2')) return 'mastercard';
    if (cleanNumber.startsWith('3')) return 'amex';
    return null;
  };

  const validateField = (field: keyof PaymentData, value: string): boolean => {
    switch (field) {
      case 'cardNumber': {
        const cleanNumber = value.replace(/\s/g, '');
        return cleanNumber.length >= 13 && cleanNumber.length <= 19;
      }
      case 'expiryMonth':
      case 'expiryYear':
        return value.length > 0;
      case 'cvv':
        return value.length >= 3 && value.length <= 4;
      case 'cardholderName':
        return value.trim().length >= 2;
      case 'email':
        return /\S+@\S+\.\S+/.test(value);
      default:
        return true;
    }
  };

  const handleInputChange = (field: keyof PaymentData, value: string) => {
    let formattedValue = value;

    if (field === "cardNumber") {
      formattedValue = formatCardNumber(value);
      // Detect card type
      const detectedType = detectCardType(formattedValue);
      setCardType(detectedType);
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }));

    // Real-time validation
    const isValid = validateField(field, formattedValue);
    setFieldValidation(prev => ({ ...prev, [field]: isValid }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<PaymentData> = {};

    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, "").length < 13) {
      newErrors.cardNumber = "Valid card number is required";
    }

    if (!formData.expiryMonth || !formData.expiryYear) {
      newErrors.expiryMonth = "Expiry date is required";
    } else {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const expiryYear = parseInt(formData.expiryYear);
      const expiryMonth = parseInt(formData.expiryMonth);

      if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
        newErrors.expiryMonth = "Card has expired";
      }
    }

    if (!formData.cvv || formData.cvv.length < 3) {
      newErrors.cvv = "CVV is required";
    }

    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = "Cardholder name is required";
    }

    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Valid email is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" role="form" aria-labelledby="payment-form-title">
          <div className="text-center mb-6" role="region" aria-labelledby="payment-amount">
            <div id="payment-amount" className="text-2xl font-bold text-primary" aria-label={`Total amount to pay: R${amount.toFixed(2)}`}>
              R{amount.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">Total amount to pay</div>
          </div>
  
          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-4 mb-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
              <Lock className="h-4 w-4" />
              <span>256-bit SSL encryption</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
              <Shield className="h-4 w-4" />
              <span>Secure payment</span>
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="your@email.com"
                className={`pr-10 ${errors.email ? "border-destructive" : fieldValidation.email ? "border-green-500" : ""}`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {fieldValidation.email && <CheckCircle className="h-4 w-4 text-green-500" />}
                {formData.email && !fieldValidation.email && !errors.email && <AlertCircle className="h-4 w-4 text-orange-500" />}
              </div>
            </div>
            {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
            {fieldValidation.email && <p className="text-sm text-green-600 mt-1">Valid email address</p>}
          </div>

          <div>
            <Label htmlFor="cardholderName">Cardholder Name</Label>
            <div className="relative">
              <Input
                id="cardholderName"
                value={formData.cardholderName}
                onChange={(e) => handleInputChange("cardholderName", e.target.value)}
                placeholder="John Doe"
                className={`pr-10 ${errors.cardholderName ? "border-destructive" : fieldValidation.cardholderName ? "border-green-500" : ""}`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {fieldValidation.cardholderName && <CheckCircle className="h-4 w-4 text-green-500" />}
                {formData.cardholderName && !fieldValidation.cardholderName && !errors.cardholderName && <AlertCircle className="h-4 w-4 text-orange-500" />}
              </div>
            </div>
            {errors.cardholderName && <p className="text-sm text-destructive mt-1">{errors.cardholderName}</p>}
            {fieldValidation.cardholderName && <p className="text-sm text-green-600 mt-1">Valid cardholder name</p>}
          </div>

          <div>
            <Label htmlFor="cardNumber">Card Number</Label>
            <div className="relative">
              <Input
                id="cardNumber"
                value={formData.cardNumber}
                onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className={`pr-12 ${errors.cardNumber ? "border-destructive" : fieldValidation.cardNumber ? "border-green-500" : ""}`}
                aria-describedby={errors.cardNumber ? "cardNumber-error" : fieldValidation.cardNumber ? "cardNumber-valid" : undefined}
                aria-invalid={!!errors.cardNumber}
                autoComplete="cc-number"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {cardType && (
                  <div className="text-lg font-bold text-muted-foreground">
                    {cardType === 'visa' && '💳'}
                    {cardType === 'mastercard' && '💳'}
                    {cardType === 'amex' && '💳'}
                  </div>
                )}
                {fieldValidation.cardNumber && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {formData.cardNumber && !fieldValidation.cardNumber && !errors.cardNumber && (
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                )}
              </div>
            </div>
            {errors.cardNumber && (
              <div className="flex items-center gap-2 mt-1 animate-in slide-in-from-top-1 duration-200">
                <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                <p id="cardNumber-error" className="text-sm text-destructive" role="alert">{errors.cardNumber}</p>
              </div>
            )}
            {fieldValidation.cardNumber && (
              <div className="flex items-center gap-2 mt-1 animate-in slide-in-from-top-1 duration-200">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <p id="cardNumber-valid" className="text-sm text-green-600">Valid card number</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="expiryMonth">Month</Label>
              <select
                id="expiryMonth"
                value={formData.expiryMonth}
                onChange={(e) => handleInputChange("expiryMonth", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${errors.expiryMonth ? "border-destructive" : "border-input"}`}
              >
                <option value="">MM</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month.toString().padStart(2, "0")}>
                    {month.toString().padStart(2, "0")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="expiryYear">Year</Label>
              <select
                id="expiryYear"
                value={formData.expiryYear}
                onChange={(e) => handleInputChange("expiryYear", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${errors.expiryMonth ? "border-destructive" : "border-input"}`}
              >
                <option value="">YYYY</option>
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="cvv">CVV</Label>
              <div className="relative">
                <Input
                  id="cvv"
                  value={formData.cvv}
                  onChange={(e) => handleInputChange("cvv", e.target.value.replace(/\D/g, ""))}
                  placeholder="123"
                  maxLength={4}
                  className={`pr-10 ${errors.cvv ? "border-destructive" : fieldValidation.cvv ? "border-green-500" : ""}`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {fieldValidation.cvv && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {formData.cvv && !fieldValidation.cvv && !errors.cvv && <AlertCircle className="h-4 w-4 text-orange-500" />}
                </div>
              </div>
            </div>
          </div>
          {errors.expiryMonth && <p className="text-sm text-destructive mt-1">{errors.expiryMonth}</p>}
          {errors.cvv && <p className="text-sm text-destructive mt-1">{errors.cvv}</p>}

          {/* Payment Guarantees */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Payment Protection Guarantee</h4>
                <ul className="text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• 30-day money-back guarantee</li>
                  <li>• Secure SSL encryption</li>
                  <li>• No hidden fees</li>
                  <li>• Instant order confirmation</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>Your payment information is secure and encrypted</span>
          </div>

          <Button type="submit" className="w-full transition-all duration-200 hover:scale-[1.02]" disabled={loading}>
            {loading ? "Processing..." : `Pay R${amount.toFixed(2)}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PaymentForm;