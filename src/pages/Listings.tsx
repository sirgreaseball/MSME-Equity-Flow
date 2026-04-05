import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { getAllListings, getBusiness } from '@/lib/db';
import { Listing, Business } from '@/data/msme';
import Navbar from '@/components/Navbar';
import ListingCard from "@/components/ListingCard";
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface ListingWithBusiness extends Listing {
  business?: Business;
}

const Listings = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<ListingWithBusiness[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const data = await getAllListings();
        // Fetch business details for each listing
        const enrichedListings = await Promise.all(
          data.map(async (l) => {
            const b = await getBusiness(l.businessId);
            return { ...l, business: b || undefined };
          })
        );
        setListings(enrichedListings);
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  const handleInvest = (listingId: string, amount: number) => {
    // Note: The actual Firestore update is handled inside the modal/service.
    // This local update just provides immediate feedback if needed.
    setListings(prev => 
      prev.map(l => l.id === listingId 
        ? { ...l, amountRaised: l.amountRaised + amount, investorsCount: l.investorsCount + 1 } 
        : l
      )
    );
  };

  const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

  return (
    <div className="min-h-screen bg-background">
      <Navbar onNavigate={() => {}} />

      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              {user?.role === 'business' ? 'Marketplace' : 'Business Listings'}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {user?.role === 'business'
                ? 'Explore investment opportunities and see how your competitors are performing.'
                : 'Discover promising small and medium enterprises seeking investment. Support local businesses and earn equity in their success.'
              }
            </p>
            {user?.role === 'business' && (
              <div className="mt-6">
                <Button onClick={() => navigate('/my-listings')}>
                  View My Listings
                </Button>
              </div>
            )}
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {listings.length === 0 ? (
                <div className="col-span-3 text-center py-20 text-muted-foreground">
                  <p className="text-sm">No active listings found. Check back soon.</p>
                </div>
              ) : (
                listings.map((listing, index) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.5, ease }}
                  >
                    <ListingCard listing={listing} onInvest={handleInvest} />
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Listings;