import { useState, useEffect } from 'react';
import { Proposal, Business, User, formatEquity, Investment } from '@/data/msme';
import { getProposalsByBusinessId, getUserInvestments } from '@/lib/db';
import ProposalCard from './ProposalCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Gavel, Info, ShieldCheck, Loader2 } from 'lucide-react';

interface GovernanceTabProps {
  business: Business;
  user: User | null;
}

const GovernanceTab = ({ business, user }: GovernanceTabProps) => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEquity, setUserEquity] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!business.id) return;
      
      try {
        setLoading(true);
        // Fetch proposals
        const props = await getProposalsByBusinessId(business.id);
        setProposals(props);

        // Calculate user equity specifically for this business
        if (user) {
          // If Sarah (owner of biz-1), she holds the non-offered equity
          if (user.email === 'sarah@techcorp.com' && business.id === 'biz-1') {
            setUserEquity(85.0); // 100% - 15% offered
          } else {
            const investments = await getUserInvestments(user.id);
            const equity = investments.reduce((sum, inv) => {
              if (inv.listingId === 'list-1' && business.id === 'biz-1') return sum + inv.equityReceived;
              return sum;
            }, 0);

            // Special handling for Dhruv/John demo IDs if no real investment yet
            if (equity === 0) {
              if (user.name.toLowerCase().includes('dhruv')) setUserEquity(2.5);
              else if (user.name.toLowerCase().includes('john')) setUserEquity(0.75);
              else setUserEquity(0.1); // Small stake for others
            } else {
              setUserEquity(equity);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching governance data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [business.id, user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse font-display tracking-widest uppercase">Fetching Governance Ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pt-6">
      {/* Governance Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 p-6 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg mb-1">Democratic Micro-Equity</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              As a verified stakeholder in {business.businessName}, your voting power is directly proportional to your equity ownership. 
              Decisions made here are binding and executed via smart-contract logic once a quorum is reached.
            </p>
          </div>
        </div>
        
        <div className="p-6 bg-muted/30 border border-border rounded-xl flex flex-col justify-center items-center text-center">
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">My Total Voting Power</div>
          <div className="text-3xl font-display font-black text-primary">
            {formatEquity(userEquity)}
          </div>
          <div className="mt-2 flex items-center gap-1 text-[9px] text-green-500 font-bold uppercase tracking-tighter">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Verified Holder
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <Gavel className="w-5 h-5 text-muted-foreground" />
        <h2 className="text-2xl font-display font-bold">Active Proposals</h2>
      </div>

      {proposals.length === 0 ? (
        <div className="p-12 border border-dashed border-border rounded-xl text-center">
          <Info className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-display text-lg mb-1">No Active Proposals</h3>
          <p className="text-sm text-muted-foreground">The founder has not posted any items for vote yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {proposals.map((proposal) => (
            <ProposalCard 
              key={proposal.id} 
              proposal={proposal} 
              userId={user?.id || ''} 
              userEquity={userEquity}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GovernanceTab;
