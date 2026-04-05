import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { 
  getAllUsers, 
  getAllListings, 
  getAllInvestments, 
  getAllBusinesses,
  getBusiness 
} from '@/lib/db';
import { Investment, Listing, Business, User } from '@/data/msme';
import { 
  ShieldCheck, 
  Users, 
  BarChart3, 
  Activity, 
  TrendingUp, 
  Globe, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight,
  Database,
  Lock,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Extended Investment type to include business and user info for the log
interface InvestmentLogEntry extends Investment {
  businessName?: string;
  userName?: string;
}

const Admin = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { format, symbol } = useCurrency();
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [investments, setInvestments] = useState<InvestmentLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [usersData, listingsData, investmentsData, businessesData] = await Promise.all([
          getAllUsers(),
          getAllListings(),
          getAllInvestments(),
          getAllBusinesses()
        ]);

        // Enrich investments with business names and user names
        const enrichedInvestments = investmentsData.map(inv => {
          const biz = businessesData.find(b => {
             const listing = listingsData.find(l => l.id === inv.listingId);
             return b.id === listing?.businessId;
          });
          const usr = usersData.find(u => u.id === inv.userId);
          return {
            ...inv,
            businessName: biz?.businessName || 'Unknown Business',
            userName: usr?.name || 'Unknown User'
          };
        });

        setUsers(usersData as User[]);
        setListings(listingsData);
        setInvestments(enrichedInvestments);
        setBusinesses(businessesData);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background pt-24 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
        <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground animate-pulse">Syncing Global Ledger...</p>
      </div>
    );
  }

  // Security check - mock for demo
  // if (!isAuthenticated) {
  //   navigate('/auth');
  //   return null;
  // }

  const totalAUM = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalFees = totalAUM * 0.025; // 2.5% platform fee
  const activeInvestors = new Set(investments.map(inv => inv.userId)).size;

  const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] uppercase font-bold tracking-widest">
                <ShieldCheck className="w-3 h-3" /> Root Access · Equity Flow Command Center
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-[-0.02em]">
                Platform Admin
              </h1>
              <p className="text-muted-foreground mt-2 max-w-xl">
                Global visibility into TGE participation, user growth, and decentralized ledger activity.
              </p>
            </div>
            
            <div className="flex gap-3">
              <div className="px-4 py-2 bg-card border border-border rounded-lg shadow-sm">
                <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest mb-1">System Status</p>
                <div className="flex items-center gap-2 text-green-500 font-bold text-xs uppercase">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Operational
                </div>
              </div>
            </div>
          </motion.div>

          {/* Core Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[
              { label: 'Total Volume (AUM)', value: format(totalAUM), icon: TrendingUp, delta: '+14% growth' },
              { label: 'Fees Collected', value: format(totalFees), icon: BarChart3, delta: '2.5% fixed' },
              { label: 'Platform Users', value: users.length, icon: Users, delta: 'Verified KYC' },
              { label: 'Active Listings', value: listings.length, icon: Globe, delta: 'Open TGEs' },
            ].map((stat, i) => (
              <Card key={i} className="group hover:border-primary/30 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{stat.label}</CardTitle>
                  <stat.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-display">{stat.value}</div>
                  <p className="text-[10px] text-muted-foreground mt-1 flex items-center">
                    <Activity className="w-3 h-3 mr-1" /> {stat.delta}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="bg-muted/10 border border-border/50 p-1 mb-6">
              <TabsTrigger value="activity" className="text-xs uppercase font-bold tracking-widest px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Clock className="w-3 h-3 mr-2" /> Global Activity
              </TabsTrigger>
              <TabsTrigger value="listings" className="text-xs uppercase font-bold tracking-widest px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Database className="w-3 h-3 mr-2" /> TGE Listings
              </TabsTrigger>
              <TabsTrigger value="users" className="text-xs uppercase font-bold tracking-widest px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <ShieldCheck className="w-3 h-3 mr-2" /> User Management
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activity">
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Global Transaction Log</CardTitle>
                  <CardDescription>Live audit trail of all equity token minting across the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-border bg-muted/20 text-[10px] uppercase font-bold tracking-[0.1em] text-muted-foreground">
                          <th className="px-4 py-3">Timestamp</th>
                          <th className="px-4 py-3">Investor</th>
                          <th className="px-4 py-3">Business</th>
                          <th className="px-4 py-3 text-right">Amount</th>
                          <th className="px-4 py-3 text-right">Equity %</th>
                          <th className="px-4 py-3 text-right">Settlement</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {investments.map((inv) => (
                          <tr key={inv.id} className="hover:bg-muted/5 transition-colors group">
                            <td className="px-4 py-4 text-xs font-mono text-muted-foreground">
                              {new Date(inv.investedAt).toLocaleString()}
                            </td>
                            <td className="px-4 py-4">
                              <div className="font-medium text-sm">{inv.userName}</div>
                              <div className="text-[10px] text-muted-foreground font-mono truncate max-w-[100px]">{inv.userId}</div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="font-medium text-sm">{inv.businessName}</div>
                              <Badge variant="outline" className="text-[9px] uppercase tracking-tighter mt-1 bg-primary/5 border-primary/20">TGE Contract</Badge>
                            </td>
                            <td className="px-4 py-4 text-right font-display font-medium">
                              {format(inv.amount)}
                            </td>
                            <td className="px-4 py-4 text-right text-sm text-green-500 font-medium">
                              {inv.equityReceived.toFixed(4)}%
                            </td>
                            <td className="px-4 py-4 text-right">
                              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-green-500/5 text-green-500 text-[10px] font-bold uppercase border border-green-500/10">
                                <CheckCircle2 className="w-3 h-3" /> Atomic Swap
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="listings">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((list) => {
                  const biz = businesses.find(b => b.id === list.businessId);
                  const progress = (list.amountRaised / list.fundingGoal) * 100;
                  return (
                    <Card key={list.id} className="hover:shadow-lg transition-all border-border/60">
                      <CardHeader className="pb-3 border-b border-border/40">
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <CardTitle className="text-base font-display font-bold">{biz?.businessName}</CardTitle>
                            <CardDescription className="text-[10px] uppercase font-mono mt-0.5">{list.id}</CardDescription>
                          </div>
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[9px] uppercase tracking-wider">Live</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-4">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-bold">{progress.toFixed(1)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                          </div>
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>{format(list.amountRaised)}</span>
                            <span>{format(list.fundingGoal)} goal</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <div className="p-2 rounded bg-muted/30 border border-border/50">
                            <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Equity Pool</p>
                            <p className="text-sm font-display font-bold">{list.equityOffered}%</p>
                          </div>
                          <div className="p-2 rounded bg-muted/30 border border-border/50">
                            <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Investors</p>
                            <p className="text-sm font-display font-bold">{list.investorsCount}</p>
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => navigate(`/listing/${list.id}`)}
                          className="w-full py-2 flex items-center justify-center gap-2 text-[10px] uppercase font-bold tracking-[0.2em] border border-border hover:bg-muted transition-colors rounded"
                        >
                          Audit Data Room <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="users">
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Registered Accounts</CardTitle>
                  <CardDescription>Comprehensive directory of platform participants and their compliance status.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-border bg-muted/20 text-[10px] uppercase font-bold tracking-[0.1em] text-muted-foreground">
                          <th className="px-4 py-3">Account Name</th>
                          <th className="px-4 py-3">Type</th>
                          <th className="px-4 py-3">KYC Status</th>
                          <th className="px-4 py-3">Created</th>
                          <th className="px-4 py-3 text-right">Wallet Connection</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-muted/5 transition-colors group">
                            <td className="px-4 py-4">
                              <div className="font-medium text-sm">{u.name}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">{u.email}</div>
                              <div className="text-[9px] text-muted-foreground font-mono mt-1">{u.id}</div>
                            </td>
                            <td className="px-4 py-4">
                              <Badge variant={u.role === 'business' ? 'outline' : 'secondary'} className="text-[9px] uppercase tracking-widest font-bold">
                                {u.role === 'business' ? 'Business Owner' : 'Investor'}
                              </Badge>
                            </td>
                            <td className="px-4 py-4">
                              <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${u.kycVerified ? 'text-green-500' : 'text-orange-500'}`}>
                                {u.kycVerified ? <><CheckCircle2 className="w-3 h-3" /> Verified</> : <><Lock className="w-3 h-3" /> Pending</>}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-xs text-muted-foreground">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-4 text-right">
                              <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary/20 border border-primary/40 animate-pulse" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;
