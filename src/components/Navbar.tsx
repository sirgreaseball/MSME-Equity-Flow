import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { UserCircle, LogOut, Wallet, Settings, Activity, ShieldCheck, Loader2, Blocks, Globe, Database, Gavel } from "lucide-react";

interface NavbarProps {
  onNavigate?: () => void;
}

const Navbar = ({ onNavigate }: NavbarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, walletAddress, connectWallet, disconnectWallet, isConnectingWallet } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    navigate('/');
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-[100] flex items-center justify-between w-full px-6 md:px-10 py-4 border-b border-border"
      style={{
        background: "rgba(10, 10, 10, 0.7)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Left: logo + links */}
      <div className="flex items-center gap-10">
        <Link
          to="/"
          className="flex items-center gap-2 group transition-all"
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary group-hover:rotate-12 transition-transform">
            <Blocks className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-display text-base font-black tracking-tighter text-foreground group-hover:text-primary transition-colors">EQUITY FLOW</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/listings"
            className={`text-[11px] font-medium tracking-[0.15em] uppercase transition-colors duration-200 bg-transparent border-none cursor-pointer ${
              isActive('/listings')
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Marketplace
          </Link>
          {isAuthenticated && user?.role === 'business' && (
            <Link
              to="/my-listings"
              className={`text-[11px] font-medium tracking-[0.15em] uppercase transition-colors duration-200 bg-transparent border-none cursor-pointer ${
                isActive('/my-listings')
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              My Equity Tokens
            </Link>
          )}
          <Link
            to="/dashboard"
            className={`text-[11px] font-medium tracking-[0.15em] uppercase transition-colors duration-200 bg-transparent border-none cursor-pointer ${
              isActive('/dashboard')
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Dashboard
          </Link>
          {isAuthenticated && (
            <Link
              to="/governance"
              className={`text-[11px] font-medium tracking-[0.15em] uppercase transition-colors duration-200 bg-transparent border-none cursor-pointer ${
                isActive('/governance')
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Governance
            </Link>
          )}
          <Link
            to="/trade"
            className={`text-[11px] font-medium tracking-[0.15em] uppercase transition-colors duration-200 bg-transparent border-none cursor-pointer ${
              isActive('/trade')
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Secondary Market
          </Link>
        </div>
      </div>

      {/* Right: auth/wallet */}
      <div className="flex items-center gap-4 relative" ref={dropdownRef}>
        {!isAuthenticated ? (
          <>
            <Link
              to="/create-listing"
              className="px-3 py-1.5 rounded-full text-[10px] font-bold tracking-[0.1em] uppercase bg-purple-500/10 text-purple-500 border border-purple-500/20 hover:bg-purple-500/20 transition-all mr-2 flex items-center"
            >
              Demo Mint
            </Link>
            <Link
              to="/auth"
              className="text-[11px] font-medium tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-200 mr-2"
            >
              Login
            </Link>
            <button className="px-5 py-2 rounded-md text-[11px] font-medium tracking-[0.15em] uppercase border border-foreground/20 text-foreground hover:bg-foreground hover:text-background transition-all duration-200 bg-transparent cursor-pointer">
              Connect Wallet
            </button>
          </>
        ) : (
          <>
            {!walletAddress ? (
              <button 
                onClick={connectWallet}
                disabled={isConnectingWallet}
                className="px-4 py-2 rounded-md text-[10px] font-medium tracking-[0.15em] uppercase border border-foreground/20 text-foreground hover:bg-muted transition-all duration-200 bg-transparent cursor-pointer flex items-center gap-2"
              >
                {isConnectingWallet ? <Loader2 className="w-3 h-3 animate-spin"/> : <Wallet className="w-3 h-3" />}
                {isConnectingWallet ? "Connecting..." : "Connect"}
              </button>
            ) : (
              <button 
                className="px-4 py-2 rounded-md text-[10px] font-medium tracking-[0.15em] uppercase border border-green-500/30 text-green-500 hover:bg-green-500/10 transition-all duration-200 bg-green-500/5 cursor-pointer flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                {walletAddress}
              </button>
            )}

            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors ml-2"
            >
              <UserCircle className="w-6 h-6 text-foreground/80" />
            </button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-14 right-0 w-64 bg-card border border-border rounded-xl shadow-2xl overflow-hidden py-2"
                >
                  <div className="px-4 py-3 border-b border-border/50 bg-muted/20">
                    <p className="font-display font-bold text-sm truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    {user?.kycVerified && (
                      <div className="flex items-center gap-1 mt-2 text-green-500 text-[10px] uppercase font-bold tracking-widest">
                        <ShieldCheck className="w-3 h-3" />
                        Verified Account
                      </div>
                    )}
                    {user?.role === 'admin' && (
                      <Link 
                        to="/admin" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center mt-2 text-xs font-bold tracking-widest text-purple-500 hover:text-purple-400 transition-all"
                      >
                        <Database className="w-3.5 h-3.5 mr-2" />
                        Admin Portal
                      </Link>
                    )}
                  </div>

                  <div className="py-2">
                    <button 
                      onClick={() => { setIsDropdownOpen(false); navigate('/dashboard'); }}
                      className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-muted transition-colors cursor-pointer text-foreground font-medium"
                    >
                      <Activity className="w-4 h-4 text-primary" />
                      {user?.role === 'business' ? 'Business Management' : 'My Portfolio Dashboard'}
                    </button>
                    {user?.role === 'business' && (
                      <button 
                        onClick={() => { setIsDropdownOpen(false); navigate('/my-listings'); }}
                        className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-muted transition-colors cursor-pointer text-foreground"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-500" />
                        My MSME Tokens
                      </button>
                    )}
                    <button 
                      onClick={() => { setIsDropdownOpen(false); navigate('/governance'); }}
                      className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-muted transition-colors cursor-pointer text-foreground font-medium"
                    >
                      <Gavel className="w-4 h-4 text-primary" />
                      Digital Governance
                    </button>
                    <button className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-muted transition-colors cursor-pointer text-muted-foreground">
                      <Settings className="w-4 h-4" />
                      Account Settings
                    </button>
                    {!walletAddress ? (
                      <button 
                        onClick={() => { setIsDropdownOpen(false); connectWallet(); }}
                        className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-muted transition-colors cursor-pointer"
                      >
                        <Wallet className="w-4 h-4 text-muted-foreground" />
                        Link Web3 Wallet
                      </button>
                    ) : (
                      <button 
                        onClick={() => { setIsDropdownOpen(false); disconnectWallet(); }}
                        className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-muted transition-colors cursor-pointer text-orange-500"
                      >
                        <Wallet className="w-4 h-4" />
                        Disconnect Wallet
                      </button>
                    )}
                  </div>

                  <div className="px-4 py-2 border-t border-border/50 bg-muted/10">
                    <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground mb-3 px-1">Display Currency</p>
                    <div className="flex p-1 bg-background rounded-lg border border-border">
                      <button 
                        onClick={() => setCurrency('USD')}
                        className={`flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all ${currency === 'USD' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        USD ($)
                      </button>
                      <button 
                        onClick={() => setCurrency('INR')}
                        className={`flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all ${currency === 'INR' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        INR (₹)
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-border/50 py-2">
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-destructive/10 text-destructive transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
