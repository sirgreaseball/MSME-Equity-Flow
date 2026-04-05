import { useState, useEffect, forwardRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { getUserInvestments, getListing, getBusiness } from "@/lib/db";
import { Investment, Listing, Business, formatEquity } from "@/data/msme";

const ease = [0.16, 1, 0.3, 1] as const;

interface EnrichedInvestment extends Investment {
  listing?: Listing;
  business?: Business;
}

const Dashboard = forwardRef<HTMLElement>((_, ref) => {
  const { user, isAuthenticated } = useAuth();
  const [investments, setInvestments] = useState<EnrichedInvestment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!user) return;
      try {
        const invData = await getUserInvestments(user.id);
        const enriched = await Promise.all(
          invData.map(async (inv) => {
            const l = await getListing(inv.listingId);
            const b = l ? await getBusiness(l.businessId) : null;
            return { ...inv, listing: l || undefined, business: b || undefined };
          })
        );
        setInvestments(enriched);
      } catch (error) {
        console.error("Error fetching portfolio:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchPortfolio();
    } else {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const activeCount = investments.length;
  // Mock returns for demo purposes, or can be calculated if data exists
  const estimatedReturns = totalInvested * 0.089; 

  const stats = [
    { label: "Total Invested", value: `₹${totalInvested.toLocaleString()}` },
    { label: "Active Investments", value: activeCount.toString() },
    { label: "Estimated Returns", value: `₹${estimatedReturns.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
  ];
  return (
    <section ref={ref} id="dashboard" className="px-6 md:px-10 py-24 border-t border-border">
      <motion.h2
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.7, ease }}
        className="font-display text-3xl md:text-5xl font-extrabold tracking-[-0.02em] text-foreground mb-16"
      >
        Dashboard
      </motion.h2>

      {/* Stats inline */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.7, ease }}
        className="flex flex-col md:flex-row gap-0 mb-16 border border-border rounded-lg overflow-hidden"
      >
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`flex-1 p-6 ${i < stats.length - 1 ? "md:border-r border-b md:border-b-0 border-border" : ""}`}
          >
            <p className="text-[11px] text-muted-foreground tracking-[0.15em] uppercase">{stat.label}</p>
            <p className="font-display text-2xl font-extrabold text-foreground mt-2">{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Portfolio */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.7, delay: 0.1, ease }}
      >
        <h3 className="font-display text-xl font-bold text-foreground mb-6">Portfolio</h3>
        <div className="divide-y divide-border border-t border-border">
          {/* ... existing portfolio loop ... */}
          {loading ? (
            <div className="py-10 text-center text-muted-foreground">Loading portfolio...</div>
          ) : (
            investments.map((inv) => (
              <div key={inv.id} className="py-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {inv.business?.businessName || "Unknown Business"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatEquity(inv.equityReceived)} equity
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">₹{inv.amount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Active stake</p>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Governance Link inside Dashboard */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2, ease }}
        className="mt-16 p-8 bg-primary/5 border border-primary/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="space-y-2 text-center md:text-left">
          <h3 className="font-display text-xl font-bold flex items-center gap-2 justify-center md:justify-start">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            Consensus & Governance
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Your equity tokens grant you voting rights in key business decisions. Participate in active proposals across your portfolio.
          </p>
        </div>
        <a 
          href="/governance" 
          className="px-8 py-3 bg-primary text-primary-foreground rounded-full text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20"
        >
          Enter Governance Portal
        </a>
      </motion.div>
    </section>
  );
});

Dashboard.displayName = "Dashboard";
export default Dashboard;
