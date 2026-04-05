import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useNavigate } from 'react-router-dom';
import { getBusinessesByOwnerId, getListingsByBusinessId } from '@/lib/db';
import { Listing, Business } from '@/data/msme';
import Navbar from '@/components/Navbar';
import ListingCard from '@/components/ListingCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Target, DollarSign, Plus, Loader2 } from 'lucide-react';

const MyListings = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { format } = useCurrency();
  const navigate = useNavigate();
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserListings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        // 1. Get all businesses owned by this user
        const businesses = await getBusinessesByOwnerId(user.id);
        
        // 2. Get all listings for those businesses
        const allListings = await Promise.all(
          businesses.map(b => getListingsByBusinessId(b.id))
        );
        
        setUserListings(allListings.flat());
      } catch (error) {
        console.error("Error fetching user listings:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUserListings();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, isAuthenticated, authLoading]);

  if (!authLoading && !isAuthenticated) {
    navigate('/auth');
    return null;
  }

  const handleInvest = (listingId: string, amount: number) => {
    setUserListings(prev => 
      prev.map(l => l.id === listingId 
        ? { ...l, amountRaised: l.amountRaised + amount, investorsCount: l.investorsCount + 1 } 
        : l
      )
    );
  };

  const isDemoMode = !isAuthenticated || user?.role !== 'business';

  // Calculate stats
  const totalRaised = userListings.reduce((sum, listing) => sum + listing.amountRaised, 0);
  const totalGoal = userListings.reduce((sum, listing) => sum + listing.fundingGoal, 0);
  const totalInvestors = userListings.reduce((sum, listing) => sum + listing.investorsCount, 0);
  const averageProgress = userListings.length > 0
    ? userListings.reduce((sum, listing) => sum + (listing.amountRaised / listing.fundingGoal), 0) / userListings.length * 100
    : 0;

  const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          {(authLoading || loading) ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
              <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground animate-pulse">Syncing MSME Portfolio...</p>
            </div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease }}
                className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6 relative"
              >
                {isDemoMode && (
                  <div className="absolute -top-4 left-0 text-[9px] uppercase tracking-widest font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                    Judges Demo Override
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-display font-extrabold tracking-[-0.02em] mb-2 mt-2">
                    My MSME Tokens
                  </h1>
                  <p className="text-muted-foreground">
                    Manage your business listings and track fundraising progress.
                  </p>
                </div>
                <Button onClick={() => navigate('/create-listing')} className="font-display tracking-[0.1em] uppercase text-xs">
                  <Plus className="w-4 h-4 mr-2"/> Tokenize New Business
                </Button>
              </motion.div>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5, ease }}
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{format(totalRaised)}</div>
                      <p className="text-xs text-muted-foreground">
                        of {format(totalGoal)} goal
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5, ease }}
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Investors</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{totalInvestors}</div>
                      <p className="text-xs text-muted-foreground">
                        across all listings
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5, ease }}
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                      <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userListings.length}</div>
                      <p className="text-xs text-muted-foreground">
                        currently fundraising
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5, ease }}
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{averageProgress.toFixed(1)}%</div>
                      <p className="text-xs text-muted-foreground">
                        funding completion
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Listings */}
              {userListings.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6, ease }}
                >
                  <h2 className="text-xl font-semibold mb-6">Your Business Listings</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userListings.map((listing, index) => (
                      <motion.div
                        key={listing.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index, duration: 0.5, ease }}
                      >
                        <ListingCard listing={listing} onInvest={handleInvest} />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6, ease }}
                  className="text-center py-12"
                >
                  <div className="text-muted-foreground mb-4">
                    <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No MSME TGE active</h3>
                    <p>You haven't initiated a Token Generation Event for your business yet.</p>
                  </div>
                  <div className="flex gap-4 justify-center mt-6">
                    <Button onClick={() => navigate('/create-listing')} className="font-display tracking-widest text-[10px] uppercase">
                      <Plus className="w-4 h-4 mr-2"/> Tokenize Now
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/listings')} className="font-display tracking-widest text-[10px] uppercase">
                      Browse Marketplace
                    </Button>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyListings;