import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { createBusiness, createListing } from '@/lib/db';
import { Business, Listing } from '@/data/msme';
import Navbar from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Building2, FileText, PieChart, UploadCloud, CheckCircle2, ChevronRight, ChevronLeft, Loader2, Zap } from 'lucide-react';

const steps = [
  { id: 1, title: 'Business Profile', icon: Building2 },
  { id: 2, title: 'Due Diligence', icon: FileText },
  { id: 3, title: 'Tokenomics', icon: PieChart }
];

const CreateListing = () => {
  const { isAuthenticated, user, walletAddress } = useAuth();
  const { symbol, toBaseCurrency, currency, setCurrency } = useCurrency();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isMinting, setIsMinting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    businessName: '',
    category: '',
    location: '',
    description: '',
    fundingGoal: '',
    equityOffered: ''
  });

  // Check if we are in demo mode (unauthenticated or not a business)
  const isDemoMode = !isAuthenticated || user?.role !== 'business';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (forceDemo: boolean = false) => {
    if (!walletAddress && !isDemoMode && !forceDemo) {
      toast.error('Wallet not connected', { description: 'You must connect a Web3 wallet to mint MSME tokens.'});
      return;
    }

    setIsMinting(true);
    // Simulate smart contract compilation and IPFS pinning
    await new Promise(resolve => setTimeout(resolve, forceDemo ? 1500 : 3000));
    
    try {
      const demoOwnerId = user?.id || 'demo-user-override';
      
      // 1. Create Business
      const businessId = await createBusiness({
        ownerId: demoOwnerId,
        businessName: formData.businessName || 'Demo Business',
        category: formData.category || 'Technology',
        location: formData.location || 'Web3 Network',
        description: formData.description || 'This represents a newly tokenized on-chain asset class.',
        createdAt: new Date().toISOString(),
        pitchDeckUrl: 'ipfs://demo-pitch'
      });

      // 2. Create Listing
      const fundingGoalBase = toBaseCurrency(Number(formData.fundingGoal) || 100000);
      await createListing({
        businessId: businessId,
        fundingGoal: fundingGoalBase,
        amountRaised: 0,
        equityOffered: Number(formData.equityOffered) || 10,
        investorsCount: 0,
        createdAt: new Date().toISOString(),
        isActive: true,
      });

      toast.success(forceDemo ? 'Tokens Minted (Demo Mode)' : 'Tokens Minted Successfully!', {
        description: `${formData.equityOffered}% of ${formData.businessName || 'your business'} has been structured into on-chain liquidity tokens.`,
        duration: 5000,
      });
      
      navigate('/my-listings');
    } catch (error) {
      console.error("Creation failed:", error);
      toast.error("Failed to create listing. Please check your connection.");
    } finally {
      setIsMinting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-6">
          
          <div className="mb-12 relative">
            {isDemoMode && (
              <div className="absolute -top-6 left-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-500 text-[10px] uppercase font-bold tracking-widest border border-purple-500/20 animate-pulse">
                <Zap className="w-3 h-3" /> Judges Demo Mode Activated
              </div>
            )}
            <h1 className={`font-display text-3xl md:text-5xl font-extrabold tracking-[-0.02em] mb-4 ${isDemoMode ? 'mt-4' : ''}`}>
              Tokenize Your Business
            </h1>
            <p className="text-muted-foreground max-w-xl">
              Create a smart contract representing fractional equity in your MSME. Fill out your data room accurately to ensure investor trust.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 border-t border-border pt-12">
            
            {/* Sidebar Tracker */}
            <div className="hidden lg:block lg:col-span-1 border-r border-border pr-8">
              <div className="space-y-8 relative">
                <div className="absolute left-6 top-8 bottom-8 w-px bg-border" />
                
                {steps.map((step) => {
                  const isActive = step.id === currentStep;
                  const isCompleted = step.id < currentStep;
                  const Icon = step.icon;
                  
                  return (
                    <div key={step.id} className={`flex gap-4 relative z-10 transition-colors duration-300 ${isActive ? 'text-foreground' : isCompleted ? 'text-green-500' : 'text-muted-foreground'}`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 bg-background transition-colors duration-300 ${isActive ? 'border-foreground shadow-[0_0_15px_rgba(255,255,255,0.1)]' : Math.random() && isCompleted ? 'border-green-500 bg-green-500/10' : 'border-border'}`}>
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                      </div>
                      <div className="pt-3">
                        <div className="text-[10px] uppercase font-bold tracking-widest opacity-60">Step {step.id}</div>
                        <div className="font-display font-medium text-sm mt-1">{step.title}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form Section */}
            <div className="lg:col-span-3">
              <Card className="bg-card border border-border shadow-xl h-full min-h-[500px] flex flex-col">
                <CardContent className="p-8 flex-1 relative overflow-hidden">
                  <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                      <motion.div key="step1" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                        <div>
                          <h2 className="font-display text-xl tracking-tight mb-1">Business Profile</h2>
                          <p className="text-sm text-muted-foreground mb-8">Basic details to display on your public listing.</p>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="grid gap-2">
                            <Label htmlFor="businessName">Registered Business Name</Label>
                            <Input id="businessName" name="businessName" placeholder="e.g. Acme Industries Ltd." value={formData.businessName} onChange={handleChange} className="bg-muted/30" />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="category">Sector / Category</Label>
                              <Input id="category" name="category" placeholder="e.g. Technology" value={formData.category} onChange={handleChange} className="bg-muted/30" />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="location">Headquarters Location</Label>
                              <Input id="location" name="location" placeholder="e.g. Mumbai, India" value={formData.location} onChange={handleChange} className="bg-muted/30" />
                            </div>
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="description">Business Pitch (Max 250 words)</Label>
                            <Textarea id="description" name="description" placeholder="Describe your product, traction, and why investors should care..." value={formData.description} onChange={handleChange} className="bg-muted/30 h-32 resize-none" />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {currentStep === 2 && (
                      <motion.div key="step2" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                        <div>
                          <h2 className="font-display text-xl tracking-tight mb-1">Data Room & Due Diligence</h2>
                          <p className="text-sm text-muted-foreground mb-8">These documents will be pinned to IPFS and visible to verified investors.</p>
                        </div>

                        <div className="space-y-6">
                          <div className="border border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-muted/10 transition-colors cursor-pointer bg-muted/20">
                            <div className="w-12 h-12 bg-card rounded-full flex items-center justify-center mb-4 shadow-sm">
                              <UploadCloud className="w-6 h-6 text-foreground" />
                            </div>
                            <h3 className="font-medium text-sm">Upload Pitch Deck</h3>
                            <p className="text-xs text-muted-foreground mt-1 mb-4">PDF, PPTX up to 25MB</p>
                            <Button variant="outline" size="sm" className="pointer-events-none text-xs font-display uppercase tracking-wider">Browse Files</Button>
                          </div>

                          <div className="border border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-muted/10 transition-colors cursor-pointer bg-muted/20">
                            <div className="w-12 h-12 bg-card rounded-full flex items-center justify-center mb-4 shadow-sm">
                              <UploadCloud className="w-6 h-6 text-foreground" />
                            </div>
                            <h3 className="font-medium text-sm">Upload Financial P&L (Last 2 Yrs)</h3>
                            <p className="text-xs text-muted-foreground mt-1 mb-4">CSV, XLSX up to 10MB</p>
                            <Button variant="outline" size="sm" className="pointer-events-none text-xs font-display uppercase tracking-wider">Browse Files</Button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {currentStep === 3 && (
                      <motion.div key="step3" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                        <div>
                          <h2 className="font-display text-xl tracking-tight mb-1">Tokenomics Engine</h2>
                          <p className="text-sm text-muted-foreground mb-8">Define how much capital you are raising and the equity equivalent.</p>
                        </div>

                        <div className="space-y-6">
                           <div className="grid gap-2">
                            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Currency for Tokenomics</Label>
                            <div className="flex p-1 bg-muted/30 rounded-lg w-fit border border-border">
                              <button 
                                onClick={() => setCurrency('USD')}
                                className={`px-4 py-1.5 rounded-md text-[10px] font-bold tracking-widest uppercase transition-all ${currency === 'USD' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                              >
                                USD
                              </button>
                              <button 
                                onClick={() => setCurrency('INR')}
                                className={`px-4 py-1.5 rounded-md text-[10px] font-bold tracking-widest uppercase transition-all ${currency === 'INR' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                              >
                                INR
                              </button>
                            </div>
                           </div>

                           <div className="grid gap-2">
                            <Label htmlFor="fundingGoal" className="text-lg">Funding Goal (in {symbol})</Label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">{symbol}</span>
                              <Input 
                                id="fundingGoal" 
                                name="fundingGoal" 
                                type="number" 
                                placeholder={symbol === '$' ? "10000" : "500000"} 
                                value={formData.fundingGoal} 
                                onChange={handleChange} 
                                step={symbol === '$' ? "1000" : "10000"}
                                className="pl-8 bg-muted/30 h-14 text-lg font-display font-bold" 
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Total hard-cap for this fundraising round.</p>
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="equityOffered" className="text-lg">Equity Offered (%)</Label>
                            <div className="relative">
                              <Input id="equityOffered" name="equityOffered" type="number" placeholder="15" value={formData.equityOffered} onChange={handleChange} className="pr-8 bg-muted/30 h-14 text-lg font-display font-bold" />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">1 token will be minted for every 0.001% of equity representing your business.</p>
                          </div>
                          
                          <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Smart Contract Summary</h4>
                            <ul className="text-sm space-y-2">
                              <li className="flex justify-between border-b border-border/50 pb-1">
                                <span>Platform Fee</span>
                                <span className="font-medium text-destructive">2.5%</span>
                              </li>
                              <li className="flex justify-between border-b border-border/50 pb-1">
                                <span>Tokens to Mint</span>
                                <span className="font-medium">{Number(formData.equityOffered) * 1000 || 0} Tokens</span>
                              </li>
                              <li className="flex justify-between pt-1">
                                <span>Blockchain Network</span>
                                <span className="text-green-500 font-bold text-xs uppercase tracking-widest">Polygon zkEVM</span>
                              </li>
                            </ul>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>

                {/* Footer Controls */}
                <div className="p-6 bg-card border-t border-border flex justify-between items-center rounded-b-xl">
                  {currentStep > 1 ? (
                    <Button variant="outline" onClick={handlePrev} disabled={isMinting} className="font-display tracking-widest text-[11px] uppercase">
                      <ChevronLeft className="w-4 h-4 mr-1" /> Back
                    </Button>
                  ) : <div />}

                  {currentStep < 3 ? (
                    <Button onClick={handleNext} className="font-display tracking-widest text-[11px] uppercase">
                      Next Step <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <div className="flex gap-4 items-center">
                      <Button 
                        variant="secondary" 
                        onClick={() => handleSubmit(true)} 
                        disabled={isMinting} 
                        className="font-display tracking-widest text-[11px] uppercase border border-dashed border-orange-500/50 text-orange-500 hover:bg-orange-500/10"
                      >
                        <Zap className="w-3 h-3 mr-1" /> Demo Override
                      </Button>
                      
                      <Button onClick={() => handleSubmit(false)} disabled={isMinting || !formData.fundingGoal} className="font-display tracking-widest text-[11px] uppercase bg-green-600 hover:bg-green-700 text-white min-w-[150px]">
                        {isMinting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Minting...</> : 'Launch Equity Token'}
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateListing;
