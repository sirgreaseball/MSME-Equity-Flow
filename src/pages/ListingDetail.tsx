import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Listing, Business, User, formatEquity } from '@/data/msme';
import { getListing, getBusiness, getUserProfile, createInvestment } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, TrendingUp, Info, FileText, UploadCloud, ChevronLeft, Lock, Droplets, Loader2, ShieldCheck, Gavel, History } from 'lucide-react';
import { toast } from 'sonner';
import InvestModal from '@/components/InvestModal';
import LoginRequiredModal from '@/components/LoginRequiredModal';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import GovernanceTab from '@/components/governance/GovernanceTab';
import UpdatesTab from '@/components/governance/UpdatesTab';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { format, symbol } = useCurrency();
  const [listing, setListing] = useState<Listing | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [owner, setOwner] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDistributing, setIsDistributing] = useState(false);
  const [dividendAmount, setDividendAmount] = useState('10000');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const l = await getListing(id);
        if (l) {
          setListing(l);
          const b = await getBusiness(l.businessId);
          if (b) {
            setBusiness(b);
            const o = await getUserProfile(b.ownerId);
            setOwner(o as User);
          }
        }
      } catch (error) {
        console.error("Error fetching listing details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const isOwner = isAuthenticated && user?.id === business?.ownerId;
  const isAdmin = isAuthenticated && user?.role === 'admin';

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-6 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!listing || !business) {
    return (
      <div className="min-h-screen pt-24 px-6 flex justify-center items-center">
        <h2 className="text-2xl font-display">Listing not found</h2>
      </div>
    );
  }

  const progressPercentage = (listing.amountRaised / listing.fundingGoal) * 100;
  const remainingAmount = listing.fundingGoal - listing.amountRaised;

  const handleInvestSubmit = (amount: number) => {
    if (!isAuthenticated) {
      setIsInvestModalOpen(false);
      setIsLoginModalOpen(true);
      return;
    }
    console.log(`Invested ${amount} via ListingDetail`);
    setIsInvestModalOpen(false);
  };

  const handleDividendDrop = async () => {
    setIsDistributing(true);
    toast.info('Initiating Smart Contract Execution...', { description: 'Scanning ledger and calculating proportional token distributions.'});
    
    // Simulate transaction processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    toast.success('Funds Distributed Successfully!', { 
      description: `${format(Number(dividendAmount))} sent to 3 investor wallets automatically via zkEVM. Zero intermediary fees.`,
      duration: 5000
    });
    
    setIsDistributing(false);
    setDividendAmount('');
  };

  return (
    <div className="min-h-screen bg-background pb-20 overflow-x-hidden relative">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 relative z-10 pt-24">
        
        {/* Back button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Listings
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Content Pane */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Badge variant="outline" className="mb-4 bg-muted/50">{business.category}</Badge>
              <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-[-0.02em] mb-4">
                {business.businessName}
              </h1>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-8 border-b border-border pb-8">
                <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {business.location}</span>
                <span className="flex items-center"><Users className="w-4 h-4 mr-1" /> {owner?.name || 'Owner'}</span>
                {user?.kycVerified && <span className="flex items-center text-green-500"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Verified Investor Access</span>}
              </div>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start border-b border-border p-0 h-auto rounded-none bg-transparent space-x-6">
                  <TabsTrigger 
                    value="overview" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-0 py-3"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="dataroom"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-0 py-3"
                  >
                    Data Room <Lock className="w-3 h-3 ml-1 text-muted-foreground"/>
                  </TabsTrigger>
                  
                  {/* Governance Tabs - Only visible if authenticated */}
                  <TabsTrigger 
                    value="governance"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3"
                  >
                    Governance {!isAuthenticated && <Lock className="w-3 h-3 ml-1 text-muted-foreground opacity-50"/>}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="updates"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3"
                  >
                    Updates {!isAuthenticated && <Lock className="w-3 h-3 ml-1 text-muted-foreground opacity-50"/>}
                  </TabsTrigger>

                  {isOwner && (
                    <TabsTrigger 
                      value="captable"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-0 py-3 text-green-500"
                    >
                      Cap Table (Admin)
                    </TabsTrigger>
                  )}
                </TabsList>
                
                <TabsContent value="overview" className="pt-6 text-foreground/80 leading-relaxed space-y-6">
                  <p>{business.description}</p>
                  <div className="mt-8 p-6 bg-muted/30 rounded-lg border border-border">
                    <h3 className="font-display text-xl mb-3 flex items-center gap-2"><Info className="w-5 h-5"/> Business Highlights</h3>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      <li>Proven traction in the {business.category} market.</li>
                      <li>Seeking {format(listing.fundingGoal)} for expansion.</li>
                      <li>Offering {listing.equityOffered}% fractional equity representation.</li>
                    </ul>
                  </div>
                </TabsContent>
                
                <TabsContent value="dataroom" className="pt-6">
                  {!isAuthenticated ? (
                    <div className="p-12 text-center border border-border bg-muted/10 rounded-lg flex flex-col items-center mt-4">
                      <Lock className="w-12 h-12 text-muted-foreground mb-4" />
                      <h3 className="font-display text-xl mb-2">Access Restricted</h3>
                      <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">You must be logged in and KYC verified to access the confidential documents and financials of this MSME.</p>
                      <Button onClick={() => setIsLoginModalOpen(true)} className="font-display tracking-[0.1em] text-xs uppercase" variant="outline">Log in / Sign up</Button>
                    </div>
                  ) : (
                    <div className="space-y-4 mt-4">
                      <div className="p-4 border border-border rounded-lg flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer bg-card">
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 opacity-70" />
                          <div>
                            <p className="font-medium text-sm">Pitch Deck 2024</p>
                            <p className="text-xs text-muted-foreground mt-0.5">PDF Document · 4.2 MB · Verified Hash</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="hidden sm:flex text-xs"><UploadCloud className="w-3 h-3 mr-2"/> Download DB</Button>
                      </div>
                      
                      <div className="p-4 border border-border rounded-lg flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer bg-card">
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 opacity-70" />
                          <div>
                            <p className="font-medium text-sm">Financial Projections & P&L</p>
                            <p className="text-xs text-muted-foreground mt-0.5">CSV Datasheet · 210 KB · IPFS Gateway</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="hidden sm:flex text-xs"><UploadCloud className="w-3 h-3 mr-2"/> Download DB</Button>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="governance" className="pt-6">
                  {!isAuthenticated ? (
                    <div className="p-12 text-center border border-border bg-muted/10 rounded-lg flex flex-col items-center mt-4">
                      <Gavel className="w-12 h-12 text-muted-foreground mb-4" />
                      <h3 className="font-display text-xl mb-2">Governance Portal Locked</h3>
                      <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">Only registered and verified investors of {business.businessName} can participate in governance and cast votes on proposals.</p>
                      <Button onClick={() => setIsLoginModalOpen(true)} className="font-display tracking-[0.1em] text-xs uppercase" variant="outline">Log in to Access</Button>
                    </div>
                  ) : (
                    <GovernanceTab business={business} user={user} />
                  )}
                </TabsContent>

                <TabsContent value="updates" className="pt-6">
                  {!isAuthenticated ? (
                    <div className="p-12 text-center border border-border bg-muted/10 rounded-lg flex flex-col items-center mt-4">
                      <History className="w-12 h-12 text-muted-foreground mb-4" />
                      <h3 className="font-display text-xl mb-2">Updates Locked</h3>
                      <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">Monthly traction reports and financial updates are exclusive to the investor community of this enterprise.</p>
                      <Button onClick={() => setIsLoginModalOpen(true)} className="font-display tracking-[0.1em] text-xs uppercase" variant="outline">Log in to Access</Button>
                    </div>
                  ) : (
                    <UpdatesTab business={business} />
                  )}
                </TabsContent>

                {isOwner && (
                  <TabsContent value="captable" className="pt-6">
                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                      <div className="p-4 border-b border-border bg-muted/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <h3 className="font-display font-bold">Capitalization Table</h3>
                          <p className="text-xs text-muted-foreground">Live on-chain ledger representing fractional owners of {business.businessName}.</p>
                        </div>
                        
                        <div className="bg-background border border-border rounded-lg p-2 flex gap-2 w-full md:w-auto">
                          <div className="relative w-full md:w-32">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-xs">{symbol}</span>
                            <input 
                              type="number" 
                              value={dividendAmount}
                              onChange={(e) => setDividendAmount(e.target.value)}
                              placeholder="Amount" 
                              disabled={isDistributing}
                              className="w-full bg-transparent border-none focus:ring-0 text-sm font-display font-bold pl-5 pr-2 py-1 outline-none"
                            />
                          </div>
                          <Button 
                            size="sm" 
                            disabled={isDistributing || !dividendAmount}
                            onClick={handleDividendDrop}
                            className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] tracking-widest uppercase font-bold"
                          >
                            {isDistributing ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Distributing</> : <><Droplets className="w-3 h-3 mr-1" /> Dividend Drop</>}
                          </Button>
                        </div>
                      </div>
                      <div className="divide-y divide-border">
                        {[
                          { hash: '0x3F8a...9B21', amount: format(100000), equity: '1.2%', date: '2 days ago' },
                          { hash: '0x99C2...4E10', amount: format(50000), equity: '0.6%', date: '4 days ago' },
                          { hash: '0x1A44...0F8C', amount: format(250000), equity: '3.0%', date: '1 week ago' },
                        ].map((inv, i) => (
                          <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-border flex items-center justify-center font-mono text-xs font-bold text-foreground/80">
                                {inv.hash.slice(2, 4)}
                              </div>
                              <div>
                                <div className="font-mono text-sm font-medium flex items-center gap-2">
                                  {inv.hash} <span className="px-1.5 py-px text-[9px] bg-green-500/10 text-green-500 uppercase tracking-widest rounded flex items-center"><svg className="w-2 h-2 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> KYC</span>
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5">Purchased {inv.date} via Smart Contract</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-display font-bold">{inv.amount}</div>
                              <div className="text-xs text-muted-foreground">{inv.equity} Ownership</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </motion.div>
          </div>

          {/* Right Sidebar - Sticky Invest Panel */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-xl p-6 shadow-xl sticky top-24"
            >
              <div className="space-y-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Funding Goal</div>
                  <div className="font-display text-3xl font-bold tracking-tight">{format(listing.fundingGoal)}</div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/80">Raised</span>
                    <span className="font-medium">{format(listing.amountRaised)}</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2 bg-muted overflow-hidden" />
                  <div className="text-xs text-muted-foreground text-right">{progressPercentage.toFixed(1)}% funded</div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border mt-2">
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Equity</div>
                    <div className="font-medium text-lg">{listing.equityOffered}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Users className="w-3 h-3" /> Investors
                    </div>
                    <div className="font-medium text-lg">{listing.investorsCount}</div>
                  </div>
                </div>

                {isAdmin ? (
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-center">
                    <ShieldCheck className="w-8 h-8 mx-auto text-primary mb-2 opacity-50" />
                    <p className="text-[11px] font-bold uppercase tracking-widest text-primary">Administrator Audit Mode</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Data room & financials unlocked for oversight.</p>
                  </div>
                ) : isOwner ? (
                  <Button
                    className="w-full h-12 font-display text-[11px] font-bold tracking-[0.15em] uppercase mt-4 bg-muted text-muted-foreground hover:bg-muted cursor-not-allowed"
                    disabled
                  >
                    Your Business Listing
                  </Button>
                ) : (
                  <Button
                    className="w-full h-12 font-display text-[11px] font-bold tracking-[0.15em] uppercase mt-4"
                    onClick={() => setIsInvestModalOpen(true)}
                    disabled={remainingAmount <= 0}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    {remainingAmount <= 0 ? 'FULLY SUBSCRIBED' : 'Invest in Equity'}
                  </Button>
                )}

                {remainingAmount <= 0 && !isAdmin && !isOwner && (
                  <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg text-center animate-in fade-in zoom-in duration-500">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Round Finalized</p>
                    <p className="text-[9px] text-muted-foreground mt-1 text-balance">The cap table for this entity is now settled on-chain. No further liquidity is being accepted.</p>
                  </div>
                )}
                
                <p className="text-center text-[10px] text-muted-foreground px-2">Capital puts you at risk. Read full risk disclosures before interacting with liquidity pools.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      <InvestModal
        listing={listing}
        businessName={business.businessName}
        isOpen={isInvestModalOpen}
        onClose={() => setIsInvestModalOpen(false)}
        onInvest={handleInvestSubmit}
      />
      <LoginRequiredModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </div>
  );
};

export default ListingDetail;
