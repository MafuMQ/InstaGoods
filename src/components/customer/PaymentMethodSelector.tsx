import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Smartphone, Building2, Bitcoin, Coins, Star } from "lucide-react";

export type PaymentMethod = "card" | "mobile" | "bank" | "bitcoin" | "ethereum";

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
}

const PaymentMethodSelector = ({ selectedMethod, onMethodChange }: PaymentMethodSelectorProps) => {
  const methods = [
    {
      id: "card" as PaymentMethod,
      name: "Credit/Debit Card",
      description: "Visa, Mastercard, American Express",
      icon: CreditCard,
      available: true,
      recommended: true,
      processingTime: "Instant",
    },
    {
      id: "bitcoin" as PaymentMethod,
      name: "Bitcoin",
      description: "Pay with Bitcoin (BTC)",
      icon: Bitcoin,
      available: true,
      recommended: false,
      processingTime: "10-30 minutes",
    },
    {
      id: "ethereum" as PaymentMethod,
      name: "Ethereum",
      description: "Pay with Ethereum (ETH)",
      icon: Coins,
      available: true,
      recommended: false,
      processingTime: "5-15 minutes",
    },
    {
      id: "mobile" as PaymentMethod,
      name: "Mobile Money",
      description: "MTN Mobile Money, Airtel Money",
      icon: Smartphone,
      available: true,
      recommended: false,
      processingTime: "Instant",
    },
    {
      id: "bank" as PaymentMethod,
      name: "Bank Transfer",
      description: "Direct bank transfer (EFT)",
      icon: Building2,
      available: false, // Disabled for now
      recommended: false,
      processingTime: "1-3 business days",
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Select Payment Method</h3>
      <div className="grid gap-3">
        {methods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;

          return (
            <Card
              key={method.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-xl scale-[1.02] ring-2 ring-primary/20"
                  : method.available
                  ? "hover:border-primary/50 hover:bg-primary/5 hover:shadow-md"
                  : "opacity-50 cursor-not-allowed grayscale"
              }`}
              onClick={() => method.available && onMethodChange(method.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-3 rounded-lg transition-colors ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : method.available
                      ? "bg-muted group-hover:bg-primary/10"
                      : "bg-muted/50"
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{method.name}</h4>
                      {method.recommended && (
                        <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">
                          <Star className="h-3 w-3" />
                          Recommended
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{method.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Processing: {method.processingTime}
                      </span>
                      {!method.available && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          Coming Soon
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentMethodSelector;