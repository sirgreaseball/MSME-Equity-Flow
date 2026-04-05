import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useNavigate } from 'react-router-dom';
import { getUserInvestments, getBusinessesByOwnerId, getListingsByBusinessId, getAllListings, getBusiness } from '@/lib/db';
import { Investment, Listing, Business } from '@/data/msme';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Wallet, TrendingUp, DollarSign, Activity, Loader2, Lock } from 'lucide-react';

const portfolioData = [
  { month: 'Jan', value: 12000 },
  { month: 'Feb', value: 15500 },
  { month: 'Mar', value: 18000 },
  { month: 'Apr', value: 17500 },
  { month: 'May', value: 24000 },
  { month: 'Jun', value: 25000 },
];

interface InvestmentWithBusiness extends Investment {
  business?: Business;
  listing?: Listing;
}

const Dashboard = () => {
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const { format, symbol } = useCurrency();
  const navigate = useNavigate();

  const [investments, setInvestments] = useState<InvestmentWithBusiness[]>([]);
  const [stats, setStats] = useState({ total: 0, count: 0, returns: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];
  const isInvestor = user?.role === 'investor';

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        if (user.role === 'investor') {
          const invs = await getUserInvestments(user.id);
          // Enrich with business info
          const enriched = await Promise.all(
            invs.map(async (inv) => {
              const listings = await getAllListings();
              const listing = listings.find(l => l.id === inv.listingId);
              const business = listing ? await getBusiness(listing.businessId) : undefined;
              return { ...inv, listing: listing || undefined, business: business || undefined };
            })
          );
          setInvestments(enriched);
          const total = invs.reduce((sum, inv) => sum + inv.amount, 0);
          // Estimated returns: simulate 8% annualized
          const returns = Math.round(total * 0.08);
          setStats({ total, count: invs.length, returns });
        } else {
          // Business owner stats
          const businesses = await getBusinessesByOwnerId(user.id);
          let totalRaised = 0;
          let listingsCount = 0;
          for (const b of businesses) {
            const listings = await getListingsByBusinessId(b.id);
            totalRaised += listings.reduce((sum, l) => sum + l.amountRaised, 0);
            listingsCount += listings.length;
          }
          setStats({ total: totalRaised, count: listingsCount, returns: 0 });
        }
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && !authLoading) {
      fetchData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, isAuthenticated, authLoading, refreshKey]);

  const showLoading = authLoading || (loading && isAuthenticated);

  // ── Unauthenticated state ─────────────────────────────────────────────────
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar onNavigate={() => {}} />
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
          >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight mb-3">
              Sign in to view your Dashboard
            </h1>
            <p className="text-muted-foreground max-w-sm mx-auto mb-8">
              Your portfolio, investments, and performance data are only visible when you're logged in.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate('/auth')} className="font-display text-xs tracking-widest uppercase px-8">
                Sign In
              </Button>
              <Button variant="outline" onClick={() => navigate('/listings')} className="font-display text-xs tracking-widest uppercase">
                Browse Marketplace
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Loading state ───────────────────────────────────────────────────────
  if (showLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar onNavigate={() => {}} />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navbar onNavigate={() => {}} />

      <div className="pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-6 md:px-10">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="mb-10 flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-6 gap-4"
          >
            <div>
              <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-[-0.02em] mb-2">
                Dashboard
              </h1>
              <p className="text-muted-foreground flex items-center">
                Welcome back,&nbsp;<span className="text-foreground font-medium">{user?.name}</span>
                {user?.kycVerified && (
                  <span className="ml-3 px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] uppercase font-bold tracking-widest rounded flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Verified {isInvestor ? 'Investor' : 'Business'}
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => navigate('/listings')} className="font-display text-xs tracking-widest uppercase">
                Marketplace
              </Button>
              <Button variant="outline" onClick={logout} className="font-display text-xs tracking-widest uppercase">
                Sign Out
              </Button>
            </div>
          </motion.div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5, ease }}>
              <Card className="bg-background/40 backdrop-blur-md border-border shadow-lg">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                    {isInvestor ? 'Portfolio Value' : 'Total Capital Raised'}
                  </CardTitle>
                  <Wallet className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-display font-bold text-foreground">
                    {format(stats.total)}
                  </div>
                  <p className="text-xs text-green-500 flex items-center mt-1 font-medium">
                    <TrendingUp className="w-3 h-3 mr-1" /> +12.5% since inception
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5, ease }}>
              <Card className="bg-background/40 backdrop-blur-md border-border shadow-lg">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                    {isInvestor ? 'Estimated Returns' : 'Avg. Raise Progress'}
                  </CardTitle>
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-display font-bold text-foreground">
                    {isInvestor ? format(stats.returns) : '75.0%'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isInvestor ? 'Est. 8% annualized on deployed capital' : 'Success rate across listings'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5, ease }}>
              <Card className="bg-background/40 backdrop-blur-md border-border shadow-lg">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                    {isInvestor ? 'Active Investments' : 'Active Listings'}
                  </CardTitle>
                  <Activity className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-display font-bold text-foreground">
                    {stats.count}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isInvestor ? 'Live equity positions' : 'Active TGE campaigns'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Business owner CTA */}
          {!isInvestor && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5, ease }} className="mb-8">
              <Card className="bg-primary/5 border-primary/20 backdrop-blur-md overflow-hidden relative group cursor-pointer" onClick={() => navigate('/create-listing')}>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-6 flex items-center justify-between relative z-10">
                  <div>
                    <h3 className="font-display text-lg font-bold">Ready to raise more capital?</h3>
                    <p className="text-sm text-muted-foreground">Tokenize another business or initiate a new TGE round.</p>
                  </div>
                  <Button className="font-display text-[10px] tracking-widest uppercase px-6">Tokenize Now</Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Chart */}
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, duration: 0.6, ease }} className="mb-8">
            <Card className="h-[400px] flex flex-col pt-6 px-6 bg-background/40 backdrop-blur-md border-border shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <CardHeader className="px-0 pt-0 pb-6 flex flex-row items-end justify-between border-b border-border/50">
                <CardTitle className="font-display tracking-tight text-xl">Performance Overview</CardTitle>
                <CardDescription>Portfolio value projection · last 6 months</CardDescription>
              </CardHeader>
              <CardContent className="px-0 flex-1">
                <div className="h-[280px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={portfolioData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--foreground))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--foreground))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dx={-10} tickFormatter={(v) => `${symbol}${v.toLocaleString()}`} />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                        formatter={(value) => [format(Number(value)), 'Value']}
                      />
                      <Area type="monotone" dataKey="value" stroke="hsl(var(--foreground))" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Portfolio / Investments table */}
          {isInvestor && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6, ease }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-bold">Portfolio</h2>
                <button
                  onClick={() => setRefreshKey(k => k + 1)}
                  className="text-[11px] text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors"
                >
                  ↻ Refresh
                </button>
              </div>

              {investments.length === 0 ? (
                <div className="text-center py-16 border border-border rounded-xl">
                  <p className="text-muted-foreground text-sm mb-4">No investments yet.</p>
                  <Button onClick={() => navigate('/listings')} variant="outline" className="font-display text-xs tracking-widest uppercase">
                    Browse Listings
                  </Button>
                </div>
              ) : (
                <div className="border border-border rounded-xl overflow-hidden">
                  <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted/30 border-b border-border text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                    <div className="col-span-4">Business</div>
                    <div className="col-span-2 text-right">Invested</div>
                    <div className="col-span-2 text-right">Equity</div>
                    <div className="col-span-2 text-right">Est. Return</div>
                    <div className="col-span-2 text-right">Date</div>
                  </div>
                  {investments.map((inv, i) => (
                    <motion.div
                      key={inv.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i }}
                      className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border last:border-0 hover:bg-muted/10 transition-colors"
                    >
                      <div className="col-span-4">
                        <p className="font-medium text-sm">{inv.business?.businessName ?? 'Unknown Business'}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{inv.business?.category} · {inv.business?.location}</p>
                      </div>
                      <div className="col-span-2 text-right">
                        <p className="font-medium text-sm">{format(inv.amount)}</p>
                      </div>
                      <div className="col-span-2 text-right">
                        <p className="font-medium text-sm text-green-500">{inv.equityReceived.toFixed(3)}%</p>
                      </div>
                      <div className="col-span-2 text-right">
                        <p className="font-medium text-sm">{format(Math.round(inv.amount * 0.08))}</p>
                        <p className="text-[10px] text-muted-foreground">est. annual</p>
                      </div>
                      <div className="col-span-2 text-right">
                        <p className="text-xs text-muted-foreground">{new Date(inv.investedAt).toLocaleDateString()}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Dashboard;