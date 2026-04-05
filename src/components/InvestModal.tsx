import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Listing, calculateEquityReceived, formatEquity } from '@/data/msme';
import { createInvestment } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { toast } from "sonner";

interface InvestModalProps {
  listing: Listing | null;
  businessName: string;
  isOpen: boolean;
  onClose: () => void;
  onInvest: (amount: number) => void;
}

const InvestModal = ({ listing, businessName, isOpen, onClose, onInvest }: InvestModalProps) => {
  if (!listing || !isOpen) return null;
  const [amount, setAmount] = useState<string>('');
  const [equityReceived, setEquityReceived] = useState<number>(0);
  const { user } = useAuth();
  const { format, symbol, toBaseCurrency, currency, exchangeRate } = useCurrency();
  const [isInvesting, setIsInvesting] = useState(false);

  const remainingAmountBase = listing.fundingGoal - listing.amountRaised;
  const minAmount = currency === 'USD' ? 10 : 100;

  useEffect(() => {
    if (!listing) return;
    const displayAmount = parseFloat(amount) || 0;
    const numAmountBase = toBaseCurrency(displayAmount);
    const equity = calculateEquityReceived(numAmountBase, listing);
    setEquityReceived(equity);
  }, [amount, listing, toBaseCurrency]);

  const handleInvest = async () => {
    if (!listing || !user) return;

    const displayAmount = parseFloat(amount);
    const numAmountBase = toBaseCurrency(displayAmount);

    if (displayAmount >= minAmount && numAmountBase <= remainingAmountBase) {
      setIsInvesting(true);
      try {
        await createInvestment({
          userId: user.id,
          listingId: listing.id,
          amount: numAmountBase,
          equityReceived: equityReceived,
          investedAt: new Date().toISOString()
        });
        
        toast.success(`Successfully invested ${format(numAmountBase)} in ${businessName}`);
        onInvest(numAmountBase);
        onClose();
        setAmount('');
      } catch (error) {
        console.error("Investment failed:", error);
        toast.error("Failed to process investment. Please try again.");
      } finally {
        setIsInvesting(false);
      }
    }
  };

  const remainingAmount = listing.fundingGoal - listing.amountRaised;
  const maxInvestment = Math.min(remainingAmount, 100000); // Cap at ₹1,00,000 for demo

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md mx-4"
      >
        <div className="bg-card border rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Invest in {businessName}</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Funding Progress</div>
              <div className="flex justify-between text-sm mb-1">
                <span>Raised: {format(listing.amountRaised)}</span>
                <span>Goal: {format(listing.fundingGoal)}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Remaining: {format(remainingAmount)}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium">
                Investment Amount ({symbol})
              </Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={currency === 'USD' ? "e.g. 50" : "e.g. 1000"}
                min={currency === 'USD' ? "10" : "100"}
                max={currency === 'USD' ? Math.floor(maxInvestment / exchangeRate) : maxInvestment}
                step={currency === 'USD' ? "10" : "100"}
                className="h-11"
              />
              <div className="text-xs text-muted-foreground">
                Minimum: {currency === 'USD' ? '$10.00' : '₹100'} | Maximum: {format(maxInvestment)}
              </div>
            </div>

            {parseFloat(amount) > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-primary/5 border border-primary/20 rounded-lg"
              >
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">You are investing:</span>
                    <span className="font-medium">{format(toBaseCurrency(parseFloat(amount)))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Equity you will receive:</span>
                    <span className="font-medium text-primary">{formatEquity(equityReceived)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Based on {listing.equityOffered}% total equity offered
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleInvest}
                disabled={!amount || parseFloat(amount) < (currency === 'USD' ? 10 : 100) || toBaseCurrency(parseFloat(amount)) > remainingAmountBase || isInvesting}
                className="flex-1"
              >
                {isInvesting ? "Processing..." : "Invest Now"}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InvestModal;
