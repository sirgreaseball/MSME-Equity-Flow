const Footer = () => {
  return (
    <footer className="w-full border-t border-border bg-background py-6 mt-auto z-50">
      <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-foreground tracking-[0.2em] uppercase font-bold text-xs">
          EQUITY FLOW
        </div>
        
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
          &copy; {new Date().getFullYear()} Dhruv Sonar. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
