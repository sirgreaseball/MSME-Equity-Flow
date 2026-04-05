import { useRef, useCallback } from "react";
import { Blocks } from "lucide-react";
import IntroSection from "@/components/IntroSection";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import MSMEGrid from "@/components/MSMEGrid";
import Dashboard from "@/components/Dashboard";
import SplashCanvas from "@/components/SplashCanvas";
import ScrollRibbon from "@/components/ScrollRibbon";

const Index = () => {
  const heroRef = useRef<HTMLElement>(null);
  const howRef = useRef<HTMLElement>(null);
  const msmeRef = useRef<HTMLElement>(null);
  const dashRef = useRef<HTMLElement>(null);

  const scrollTo = useCallback((section: string) => {
    const refs: Record<string, React.RefObject<HTMLElement>> = {
      hero: heroRef,
      "how-it-works": howRef,
      "msme-grid": msmeRef,
      dashboard: dashRef,
    };
    refs[section]?.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative" style={{ backfaceVisibility: 'hidden' }}>
      <SplashCanvas />
      <ScrollRibbon />

      <IntroSection />

      <div className="bg-background">
        <Navbar />
        <HeroSection ref={heroRef} onExplore={() => scrollTo("msme-grid")} />
        <HowItWorks ref={howRef} />
        <MSMEGrid ref={msmeRef} />
        <Dashboard ref={dashRef} />

        <footer className="px-6 md:px-10 py-10 border-t border-border bg-background flex items-center justify-between">
          <div className="flex items-center gap-2 opacity-50">
            <Blocks className="w-4 h-4 text-primary" />
            <span className="font-display text-[10px] font-black tracking-tighter">EQUITY FLOW</span>
          </div>
          <p className="text-[9px] text-muted-foreground tracking-[0.15em] uppercase">
            © 2026 · Built on Blockchain
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
