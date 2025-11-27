import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, CheckCircle, ExternalLink, Wallet, RefreshCw, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CryptoPaymentFormProps {
  amount: number;
  currency: "bitcoin" | "ethereum";
  onSubmit: (transactionHash: string) => void;
  loading?: boolean;
}

const CryptoPaymentForm = ({ amount, currency, onSubmit, loading = false }: CryptoPaymentFormProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [isExpired, setIsExpired] = useState(false);

  // Mock crypto addresses - in real app, these would come from your backend
  const addresses = {
    bitcoin: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    ethereum: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
  };

  const currencySymbols = {
    bitcoin: "BTC",
    ethereum: "ETH"
  };

  const currencyNames = {
    bitcoin: "Bitcoin",
    ethereum: "Ethereum"
  };

  // Convert amount to crypto (mock conversion rates)
  const conversionRates = {
    bitcoin: 0.000023, // 1 ZAR = ~0.000023 BTC
    ethereum: 0.00031   // 1 ZAR = ~0.00031 ETH
  };

  const cryptoAmount = (amount * conversionRates[currency]).toFixed(8);
  const address = addresses[currency];

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsExpired(true);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Address copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the address manually",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionHash.trim()) {
      toast({
        title: "Transaction hash required",
        description: "Please enter your transaction hash",
        variant: "destructive",
      });
      return;
    }
    onSubmit(transactionHash);
  };

  const generateNewAddress = () => {
    // In real app, this would request a new address from your backend
    toast({
      title: "New address generated",
      description: "Please use the updated address for payment",
    });
    setTimeLeft(900); // Reset timer
    setIsExpired(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Pay with {currencyNames[currency]}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Amount Display */}
        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="text-2xl font-bold text-primary">
            {cryptoAmount} {currencySymbols[currency]}
          </div>
          <div className="text-sm text-muted-foreground">
            ≈ R{amount.toFixed(2)} ZAR
          </div>
        </div>

        {/* Timer */}
        <Alert className={isExpired ? "border-destructive" : ""}>
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                {isExpired ? "Payment window expired" : "Complete payment within:"}
              </span>
              <span className={`font-mono ${isExpired ? "text-destructive" : "text-primary"}`}>
                {isExpired ? "Expired" : formatTime(timeLeft)}
              </span>
            </div>
          </AlertDescription>
        </Alert>

        {/* Address */}
        <div>
          <Label className="text-sm font-medium">Send payment to this address:</Label>
          <div className="flex gap-2 mt-2">
            <Input
              value={address}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(address)}
              className="flex-shrink-0"
            >
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Only send {currencySymbols[currency]} to this address. Sending other cryptocurrencies may result in permanent loss.
          </p>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center space-y-3 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 text-sm font-medium">
            <QrCode className="h-4 w-4" />
            Scan QR Code
          </div>
          <div className="w-32 h-32 bg-white border-2 border-muted-foreground/20 rounded-lg flex items-center justify-center">
            <div className="text-center text-xs text-muted-foreground">
              <QrCode className="h-8 w-8 mx-auto mb-1 opacity-50" />
              <div>QR Code</div>
              <div>Placeholder</div>
            </div>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            Scan with your {currencyNames[currency]} wallet app
          </p>
        </div>

        {/* Instructions */}
        <div className="space-y-2 text-sm">
          <h4 className="font-medium">Payment Instructions:</h4>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Copy the {currencyNames[currency]} address above</li>
            <li>Open your {currencyNames[currency]} wallet</li>
            <li>Send exactly {cryptoAmount} {currencySymbols[currency]} to the address</li>
            <li>Enter your transaction hash below</li>
            <li>Click "Confirm Payment" to complete</li>
          </ol>
        </div>

        {/* Transaction Hash Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="transactionHash">Transaction Hash</Label>
            <Input
              id="transactionHash"
              value={transactionHash}
              onChange={(e) => setTransactionHash(e.target.value)}
              placeholder="Enter your transaction hash..."
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              You can find this in your wallet's transaction history
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={generateNewAddress}
              disabled={loading}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              New Address
            </Button>
            <Button
              type="submit"
              disabled={loading || isExpired}
              className="flex-1"
            >
              {loading ? "Confirming..." : "Confirm Payment"}
            </Button>
          </div>
        </form>

        {/* External Links */}
        <div className="flex gap-2 text-sm">
          <Button variant="link" size="sm" asChild className="p-0 h-auto">
            <a
              href={currency === "bitcoin" ? "https://bitcoin.org/en/getting-started" : "https://ethereum.org/en/get-eth/"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              How to buy {currencyNames[currency]}
            </a>
          </Button>
        </div>

        {/* Warning */}
        <Alert>
          <AlertDescription className="text-xs">
            <strong>Important:</strong> Cryptocurrency payments are irreversible.
            Please double-check the address and amount before sending.
            We will manually verify your payment within 30 minutes.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default CryptoPaymentForm;