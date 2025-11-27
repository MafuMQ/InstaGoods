import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface PaymentSummaryProps {
  items: CartItem[];
  subtotal: number;
  deliveryFee?: number;
  tax?: number;
  discount?: number;
  total: number;
}

const PaymentSummary = ({
  items,
  subtotal,
  deliveryFee = 0,
  tax = 0,
  discount = 0,
  total
}: PaymentSummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <img
                src={item.image}
                alt={item.name}
                className="w-12 h-12 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  Qty: {item.quantity} × R{item.price}
                </p>
              </div>
              <div className="font-semibold">
                R{(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Pricing Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>R{subtotal.toFixed(2)}</span>
          </div>

          {deliveryFee > 0 && (
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>R{deliveryFee.toFixed(2)}</span>
            </div>
          )}

          {tax > 0 && (
            <div className="flex justify-between">
              <span>Tax</span>
              <span>R{tax.toFixed(2)}</span>
            </div>
          )}

          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-R{discount.toFixed(2)}</span>
            </div>
          )}

          <Separator />

          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>R{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Order Notes */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• All prices include VAT where applicable</p>
          <p>• Delivery time: 2-5 business days</p>
          <p>• Free returns within 30 days</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentSummary;