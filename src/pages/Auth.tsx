import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'investor' | 'business'>('investor');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
    category: '',
    location: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const { login, signup, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Reactive redirect — fires once Firestore sync is fully done for ALL users (John & Sarah)
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let success = false;

      if (isLogin) {
        success = await login(formData.email, formData.password);
      } else {
        const userData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role,
          ...(role === 'business' && {
            businessName: formData.businessName,
            category: formData.category,
            location: formData.location,
          }),
        };
        success = await signup(userData);
      }

      if (!success) {
        toast({
          title: 'Authentication failed',
          description: isLogin ? 'Invalid email or password.' : 'Please check your information.',
          variant: 'destructive',
        });
      }
      // On success: the useEffect above handles navigation after auth state resolves
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease }}
            className="text-3xl font-bold tracking-tight"
          >
            {isLogin ? 'Welcome back' : 'Create account'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5, ease }}
            className="text-muted-foreground mt-2"
          >
            {isLogin ? 'Sign in to your EQUITY FLOW account' : 'Join the EQUITY FLOW platform'}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5, ease }}
          className="bg-card border rounded-lg p-6 shadow-sm"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">I am a</Label>
                <RadioGroup value={role} onValueChange={(value) => setRole(value as 'investor' | 'business')}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="investor" id="investor" />
                    <Label htmlFor="investor" className="text-sm">Investor</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="business" id="business" />
                    <Label htmlFor="business" className="text-sm">Business Owner</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    {role === 'investor' ? 'Full Name' : 'Owner Name'}
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                {role === 'business' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="businessName" className="text-sm font-medium">Business Name</Label>
                      <Input
                        id="businessName"
                        type="text"
                        value={formData.businessName}
                        onChange={(e) => handleInputChange('businessName', e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                      <Input
                        id="category"
                        type="text"
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        placeholder="e.g., Technology, Food & Beverage"
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                      <Input
                        id="location"
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="e.g., San Francisco, CA"
                        required
                        className="h-11"
                      />
                    </div>
                  </>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 mt-6"
              disabled={isLoading || authLoading}
            >
              {isLoading || authLoading ? 'Please wait...' : (isLogin ? 'Sign in' : 'Create account')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Auth;