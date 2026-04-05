import { useState, useEffect, forwardRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useNavigate } from 'react-router-dom';
import LoginRequiredModal from "./LoginRequiredModal";
import InvestModal from "./InvestModal";
import { getAllListings, getBusiness } from "@/lib/db";
import { Listing, Business } from "@/data/msme";

const ease = [0.16, 1, 0.3, 1] as const;

interface ListingWithBusiness extends Listing {
  business?: Business;
}

const MSMEGrid = forwardRef<HTMLElement>((_, ref) => {
  const [listings, setListings] = useState<ListingWithBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<ListingWithBusiness | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { format } = useCurrency();
  const navigate = useNavigate();

  const isAdmin = isAuthenticated && user?.role === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const listingsData = await getAllListings();
        // Fetch business details for each listing
        const enrichedListings = await Promise.all(
          listingsData.map(async (l) => {
            const b = await getBusiness(l.businessId);
            return { ...l, business: b || undefined };
          })
        );
        setListings(enrichedListings);
      } catch (error) {
        console.error("Error fetching grid data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInvestClick = (listing: ListingWithBusiness) => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
    } else {
      setSelectedListing(listing);
    }
  };

  const handleInvestSubmit = (amount: number) => {
    setSelectedListing(null);
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
    } else {
      // Refresh local data after investment or just navigate
      navigate('/listings');
    }
  };

  if (loading) {
    return <div className="py-24 text-center text-muted-foreground">Loading listings...</div>;
  }

  return (
    <section ref={ref} id="msme-grid" className="px-6 md:px-10 py-24 border-t border-border">
      <motion.h2
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.7, ease }}
        className="font-display text-3xl md:text-5xl font-extrabold tracking-[-0.02em] text-foreground mb-16"
      >
        Listings
      </motion.h2>

      {/* List layout */}
      <div className="divide-y divide-border">
        {listings.map((listing, i) => (
          <motion.div
            key={listing.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6, delay: i * 0.05, ease }}
            className="py-6 group"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-0">
              {/* Name + location */}
              <div className="md:w-[30%]">
                <h3 className="font-display text-lg font-bold text-foreground">
                  {listing.business?.businessName || "Unknown Business"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {listing.business?.category} · {listing.business?.location}
                </p>
              </div>

              {/* Progress bar */}
              <div className="md:w-[25%] md:px-6">
                <div className="w-full h-[2px] bg-border overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(listing.amountRaised / listing.fundingGoal) * 100}%` }}
                    viewport={{ once: false }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-full bg-foreground"
                  />
                </div>
                <div className="flex justify-between text-xs font-medium mt-2">
                  <span className="text-muted-foreground">Raised</span>
                  <span>{format(listing.amountRaised)} / {format(listing.fundingGoal)}</span>
                </div>
                <div className="flex justify-end mt-1">
                  <span className="text-[11px] text-muted-foreground">
                    {((listing.amountRaised / listing.fundingGoal) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Equity + Risk */}
              <div className="md:w-[20%] flex gap-8 md:justify-center">
                <div>
                  <p className="text-[11px] text-muted-foreground tracking-[0.1em] uppercase">Equity</p>
                  <p className="text-sm font-medium text-foreground">{listing.equityOffered}%</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground tracking-[0.1em] uppercase">Status</p>
                  <p className="text-sm text-muted-foreground">{listing.isActive ? "Active" : "Closed"}</p>
                </div>
              </div>

              <div className="md:w-[25%] md:flex md:justify-end">
                <button
                  onClick={() => isAdmin ? null : setSelectedListing(listing)}
                  disabled={isAdmin || listing.amountRaised >= listing.fundingGoal}
                  className={`px-6 py-2.5 rounded-md text-[11px] font-medium tracking-[0.15em] uppercase border border-border transition-all duration-200 ${isAdmin || listing.amountRaised >= listing.fundingGoal ? 'bg-secondary text-secondary-foreground cursor-not-allowed opacity-70' : 'text-foreground bg-transparent hover:bg-foreground hover:text-background cursor-pointer'}`}
                >
                  {isAdmin ? 'Admin Audit' : listing.amountRaised >= listing.fundingGoal ? 'Fully Subscribed' : 'Invest'}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <InvestModal
        listing={selectedListing}
        businessName={selectedListing?.business?.businessName || ""}
        isOpen={!!selectedListing}
        onClose={() => setSelectedListing(null)}
        onInvest={handleInvestSubmit}
      />

      <LoginRequiredModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </section>
  );
});

MSMEGrid.displayName = "MSMEGrid";
export default MSMEGrid;
