import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Listing, Business, User } from '@/data/msme';
import { getBusiness, getUserProfile } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MapPin, Users, TrendingUp, Loader2 } from 'lucide-react';
import InvestModal from './InvestModal';
import LoginRequiredModal from './LoginRequiredModal';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useNavigate } from 'react-router-dom';

interface ListingWithBusiness extends Listing {
  business?: Business;
}

interface ListingCardProps {
  listing: ListingWithBusiness;
  onInvest?: (listingId: string, amount: number) => void;
}

const ListingCard = ({ listing, onInvest }: ListingCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { format } = useCurrency();
  const navigate = useNavigate();
  
  const [business, setBusiness] = useState<Business | null>(listing.business || null);
  const [owner, setOwner] = useState<User | null>(null);
  const [loading, setLoading] = useState(!listing.business);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let b = business;
        if (!b) {
          b = await getBusiness(listing.businessId);
          setBusiness(b);
        }
        if (b && !owner) {
          const o = await getUserProfile(b.ownerId);
          setOwner(o as User);
        }
      } catch (error) {
        console.error("Error fetching card data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [listing.businessId, business, owner]);

  if (loading) {
    return (
      <div className="bg-card border rounded-lg p-6 h-[400px] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!business) return null;
  const isOwner = isAuthenticated && user?.id === business.ownerId;
  const isAdmin = isAuthenticated && user?.role === 'admin';

  const progressPercentage = (listing.amountRaised / listing.fundingGoal) * 100;
  const remainingAmount = listing.fundingGoal - listing.amountRaised;

  const handleInvestClick = () => {
    if (isAdmin) return;
    setIsModalOpen(true);
  };

  const handleInvest = (amount: number) => {
    if (!isAuthenticated) {
      setIsModalOpen(false);
      setIsLoginModalOpen(true);
      return;
    }
    if (onInvest) {
      onInvest(listing.id, amount);
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold leading-tight">{business.businessName}</h3>
            <span className="text-xs bg-muted px-2 py-1 rounded-full">
              {business.category}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{owner?.name || 'Loading creator...'}</p>
          <div className="flex items-center text-sm text-muted-foreground mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            {business.location}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {business.description}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Raised</span>
            <span className="font-medium">
              {format(listing.amountRaised)} / {format(listing.fundingGoal)}
            </span>
          </div>

          <Progress value={progressPercentage} className="h-2" />

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{progressPercentage.toFixed(1)}% funded</span>
            <span>{format(remainingAmount)} remaining</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Equity</div>
              <div className="font-medium">{listing.equityOffered}%</div>
            </div>
            <div>
              <div className="text-muted-foreground flex items-center">
                <Users className="w-3 h-3 mr-1" />
                Investors
              </div>
              <div className="font-medium">{listing.investorsCount}</div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              className="w-1/2 font-display uppercase tracking-widest text-[10px]"
              size="sm"
              onClick={() => navigate(`/listing/${listing.id}`)}
            >
              Data Room
            </Button>
            <Button
              className="w-1/2 font-display uppercase tracking-widest text-[10px]"
              size="sm"
              onClick={handleInvestClick}
              disabled={remainingAmount <= 0 || isOwner || isAdmin}
              variant={isOwner || isAdmin ? "secondary" : "default"}
            >
              {isAdmin ? (
                <>Admin Audit</>
              ) : (
                <>
                  {!isOwner && <TrendingUp className="w-3 h-3 mr-1" />}
                  {isOwner ? 'Owner' : remainingAmount <= 0 ? (
                    <span className="text-primary font-bold uppercase">FULLY SUBSCRIBED</span>
                  ) : 'Invest'}
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      <InvestModal
        listing={listing}
        businessName={business.businessName}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onInvest={handleInvest}
      />
      
      <LoginRequiredModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </>
  );
};

export default ListingCard;