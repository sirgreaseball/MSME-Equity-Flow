import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import GovernanceTab from '@/components/governance/GovernanceTab';
import { getAllBusinesses } from '@/lib/db';
import { Business } from '@/data/msme';
import { Loader2, Gavel, Info, ShieldCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Governance = () => {
  const { user, isAuthenticated } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        // In a real app, we'd fetch only businesses the user has invested in
        // For the demo, we'll show businesses they own or have interaction with
        const all = await getAllBusinesses();
        setBusinesses(all);
      } catch (error) {
        console.error("Error fetching businesses for governance:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBusinesses();
  }, [user]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <Navbar />
        <div className="max-w-md text-center space-y-6">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Gavel className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold">Authentication Required</h1>
          <p className="text-muted-foreground leading-relaxed">
            Please log in to your EQUITY FLOW account to access the decentralized governance portal and participate in shareholder voting.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-6 pt-24">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="mb-12"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="px-2 py-1 bg-primary/10 rounded text-[10px] uppercase font-bold tracking-widest text-primary flex items-center gap-1">
               <ShieldCheck className="w-3 h-3" /> Consensus Portal
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tighter mb-4 italic uppercase">Governance Ledger</h1>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
            Monitor active proposals, cast proportional votes, and review historical business pivots across your entire micro-equity portfolio.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue={businesses[0]?.id || ""} className="w-full">
            <div className="flex flex-col md:flex-row gap-10">
              <div className="md:w-64 shrink-0 overflow-hidden">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 px-2">Your Entities</p>
                <TabsList className="flex flex-col justify-start bg-transparent h-auto p-0 space-y-1 items-stretch">
                  {businesses.map((biz) => (
                    <TabsTrigger 
                      key={biz.id} 
                      value={biz.id}
                      className="justify-start px-4 py-3 rounded-xl border border-transparent data-[state=active]:border-border data-[state=active]:bg-muted/50 data-[state=active]:text-foreground text-muted-foreground hover:text-foreground transition-all duration-300"
                    >
                      <div className="flex flex-col items-start text-left">
                        <span className="font-bold text-sm truncate w-full">{biz.businessName}</span>
                        <span className="text-[10px] opacity-60 truncate w-full italic">{biz.category}</span>
                      </div>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <div className="flex-1">
                {businesses.map((biz) => (
                  <TabsContent key={biz.id} value={biz.id} className="mt-0 focus-visible:ring-0">
                    <GovernanceTab business={biz} user={user} />
                  </TabsContent>
                ))}
                
                {businesses.length === 0 && (
                  <div className="p-20 text-center border-2 border-dashed border-border rounded-3xl bg-muted/10">
                    <Info className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
                    <h3 className="text-2xl font-display font-bold mb-2">No Stakes Detected</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      You haven't invested in any MSMEs yet. Once you hold equity tokens, their governance proposals will appear here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Governance;
