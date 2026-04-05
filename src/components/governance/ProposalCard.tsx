import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Proposal, Vote, formatEquity } from '@/data/msme';
import { getVotesForProposal, castVote } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, AlertCircle, TrendingUp, Fingerprint, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProposalCardProps {
  proposal: Proposal;
  userId: string;
  userEquity: number;
  onVoteCast?: () => void;
}

const ProposalCard = ({ proposal, userId, userEquity, onVoteCast }: ProposalCardProps) => {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    const fetchVotes = async () => {
      const v = await getVotesForProposal(proposal.id);
      setVotes(v);
      setHasVoted(v.some(vote => vote.userId === userId));
      setLoading(false);
    };
    fetchVotes();
  }, [proposal.id, userId]);

  const tally = proposal.options.map((_, index) => {
    const optionVotes = votes.filter(v => v.optionIndex === index);
    const power = optionVotes.reduce((sum, v) => sum + v.votingPower, 0);
    return power;
  });

  const totalPower = tally.reduce((sum, p) => sum + p, 100); // 100% total theoretical power for demo
  const isActive = proposal.status === 'active' && new Date(proposal.endAt) > new Date();

  const handleVote = async (index: number) => {
    if (!isActive || hasVoted) return;

    setVoting(true);
    toast.info('Simulating ZK-Proof Generation...', { 
      description: 'Encrypting vote and verifying cryptographic footprint on-chain.',
      icon: <Fingerprint className="w-4 h-4 animate-pulse" />
    });

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await castVote({
        proposalId: proposal.id,
        userId,
        optionIndex: index,
        votingPower: userEquity,
      });

      const updatedVotes = await getVotesForProposal(proposal.id);
      setVotes(updatedVotes);
      setHasVoted(true);
      toast.success('Vote Successfully Recorded!', {
        description: `Your ${formatEquity(userEquity)} stake has been applied to the consensus ledger.`
      });
      if (onVoteCast) onVoteCast();
    } catch (error: any) {
      toast.error(error.message || 'Failed to cast vote');
    } finally {
      setVoting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-colors shadow-sm"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={isActive ? "default" : "secondary"} className="text-[10px] uppercase font-bold tracking-widest">
                {isActive ? 'Active' : proposal.status.toUpperCase()}
              </Badge>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                <Clock className="w-3 h-3" /> Ends {new Date(proposal.endAt).toLocaleDateString()}
              </span>
            </div>
            <h3 className="text-xl font-display font-bold">{proposal.title}</h3>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Your Voting Power</div>
            <div className="font-display font-bold text-lg text-primary">{formatEquity(userEquity)}</div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          {proposal.description}
        </p>

        <div className="space-y-4">
          {proposal.options.map((option, index) => {
            const percentage = (tally[index] / totalPower) * 100;
            const isUserChoice = votes.find(v => v.userId === userId)?.optionIndex === index;

            return (
              <div key={index} className="relative">
                <button
                  onClick={() => handleVote(index)}
                  disabled={!isActive || hasVoted || voting}
                  className={`w-full group text-left p-4 rounded-lg border transition-all duration-300 relative overflow-hidden ${
                    isUserChoice 
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                      : 'border-border hover:border-primary/50 bg-background/50'
                  } ${(!isActive || hasVoted) && !isUserChoice ? 'opacity-70 grayscale-[0.5]' : ''}`}
                >
                  {/* Progress background bar */}
                  <div 
                    className="absolute inset-0 bg-primary/10 transition-all duration-1000"
                    style={{ width: `${percentage}%`, opacity: 0.3 }}
                  />
                  
                  <div className="relative z-10 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        isUserChoice ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                      }`}>
                        {isUserChoice && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`font-medium text-sm ${isUserChoice ? 'text-primary' : ''}`}>{option}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{percentage.toFixed(1)}%</div>
                      <div className="text-[9px] text-muted-foreground uppercase tracking-tighter">
                        {formatEquity(tally[index])} Power
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {hasVoted && (
          <div className="mt-6 p-3 bg-muted/30 rounded-lg flex items-center justify-center gap-2 border border-border/50 animate-in fade-in zoom-in duration-300">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-xs font-medium text-muted-foreground">Your vote has been finalized on the ledger.</span>
          </div>
        )}

        {!isActive && proposal.status === 'passed' && (
          <div className="mt-6 p-3 bg-green-500/10 rounded-lg flex items-center justify-center gap-2 border border-green-500/20">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-xs font-bold text-green-500 uppercase tracking-widest">Proposal Passed & Executed</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProposalCard;
