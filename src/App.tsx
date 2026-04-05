import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import Listings from "./pages/Listings.tsx";
import MyListings from "./pages/MyListings.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import CreateListing from "./pages/CreateListing.tsx";
import Trade from "./pages/Trade.tsx";
import ListingDetail from "./pages/ListingDetail.tsx";
import Admin from "./pages/Admin.tsx";
import Governance from "./pages/Governance.tsx";
import NotFound from "./pages/NotFound.tsx";
import Footer from "./components/Footer.tsx";
import { useEffect } from "react";
import { seedDatabaseOnce } from "./lib/seed";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Seed initial mock data to Firestore once
    seedDatabaseOnce();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider>
        <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="flex flex-col min-h-screen">
              <div className="flex-1 shrink-0">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/listings" element={<Listings />} />
                  <Route path="/my-listings" element={<MyListings />} />
                  <Route path="/trade" element={<Trade />} />
                  <Route path="/create-listing" element={<CreateListing />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/governance" element={<Governance />} />
                  <Route path="/listing/:id" element={<ListingDetail />} />
                  <Route path="/admin" element={<Admin />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              <Footer />
            </div>
          </BrowserRouter>
        </TooltipProvider>
          </AuthProvider>
        </CurrencyProvider>
    </QueryClientProvider>
  );
};

export default App;
