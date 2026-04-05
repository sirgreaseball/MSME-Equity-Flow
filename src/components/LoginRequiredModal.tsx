import { motion } from 'framer-motion';
import { Lock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginRequiredModal = ({ isOpen, onClose }: LoginRequiredModalProps) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-sm mx-4"
      >
        <div className="bg-card border rounded-lg p-6 shadow-lg text-center">
          <div className="flex justify-end mb-2">
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex justify-center mb-4">
            <div className="p-4 bg-muted/50 rounded-full">
              <Lock className="w-8 h-8 text-foreground" />
            </div>
          </div>

          <h2 className="font-display text-2xl font-bold mb-2 tracking-tight">Login Required</h2>
          <p className="text-muted-foreground text-sm mb-6">
            You need to be logged in to invest and own equity. Join our community today!
          </p>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => navigate('/auth')}
              className="w-full font-display text-[11px] font-bold tracking-[0.15em] uppercase"
            >
              Log in / Sign up
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full font-display text-[11px] font-bold tracking-[0.15em] uppercase"
            >
              Cancel
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginRequiredModal;
