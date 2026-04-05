import { useState, useEffect } from 'react';
import { Business, BusinessUpdate, formatEquity } from '@/data/msme';
import { getBusinessUpdates } from '@/lib/db';
import { motion } from 'framer-motion';
import { FileText, TrendingUp, CheckCircle2, Info, ChevronRight, Calendar, Paperclip, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface UpdatesTabProps {
  business: Business;
}

const UpdatesTab = ({ business }: UpdatesTabProps) => {
  const [updates, setUpdates] = useState<BusinessUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        setLoading(true);
        const data = await getBusinessUpdates(business.id);
        setUpdates(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } catch (error) {
        console.error("Error fetching updates:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUpdates();
  }, [business.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse font-display tracking-widest uppercase">Fetching Business Intel...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pt-6 max-w-4xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div>
          <h2 className="text-2xl font-display font-bold">Investor Relations Feed</h2>
          <p className="text-sm text-muted-foreground">Official communication from {business.businessName} founders.</p>
        </div>
        <Button variant="outline" size="sm" className="hidden sm:flex text-xs font-bold uppercase tracking-widest gap-2">
          <Calendar className="w-3 h-3" /> Subscribe to Alerts
        </Button>
      </div>

      <div className="relative border-l border-border ml-3 pl-8 space-y-12">
        {updates.map((update, index) => (
          <motion.div 
            key={update.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            {/* Timeline dot */}
            <div className={`absolute -left-[41px] top-0 w-6 h-6 rounded-full border-4 border-background flex items-center justify-center ${
              update.type === 'financial' ? 'bg-green-500' : update.type === 'milestone' ? 'bg-blue-500' : 'bg-primary'
            }`}>
              {update.type === 'financial' ? <TrendingUp className="w-2.5 h-2.5 text-white" /> : <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
            </div>

            <div className="flex flex-col md:flex-row justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-tighter">
                  {update.type}
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  {new Date(update.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="bg-card border border-border p-6 rounded-xl hover:bg-muted/10 transition-colors shadow-sm">
              <h3 className="text-lg font-display font-bold mb-3">{update.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {update.content}
              </p>

              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg border border-border text-[11px] font-medium text-foreground/70 cursor-pointer hover:bg-muted transition-colors">
                  <FileText className="w-3.5 h-3.5 opacity-50" />
                  Detailed_Report_Q1.pdf
                </div>
                {update.type === 'financial' && (
                  <div className="flex items-center gap-2 p-2 bg-green-500/5 rounded-lg border border-green-500/20 text-[11px] font-bold text-green-500 cursor-pointer hover:bg-green-500/10 transition-colors uppercase tracking-widest">
                    <TrendingUp className="w-3.5 h-3.5" /> View P&L Sheet
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {updates.length === 0 && (
          <div className="p-12 text-center -ml-8">
            <Info className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-display text-lg mb-1">No Updates Published</h3>
            <p className="text-sm text-muted-foreground">The business hasn't shared any progress reports yet.</p>
          </div>
        )}
      </div>

      <div className="p-6 bg-muted/20 border border-dashed border-border rounded-xl text-center">
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-2">End of History</p>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">Historical data from before the on-chain migration is archived and available upon special request to the platform administrator.</p>
      </div>
    </div>
  );
};

export default UpdatesTab;
