import { forwardRef } from "react";
import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

const steps = [
  {
    num: "01",
    title: "Connect Your Wallet",
    desc: "Link any Web3 wallet to access the platform securely. No KYC required for initial browsing.",
  },
  {
    num: "02",
    title: "Browse Verified MSMEs",
    desc: "Explore businesses with detailed financials, sector data, and risk assessments before investing.",
  },
  {
    num: "03",
    title: "Invest & Earn Equity",
    desc: "Purchase tokenized micro-equity starting at ₹100. Track returns and trade on secondary markets.",
  },
];

const trust = [
  { label: "Regulation", value: "SEBI Compliant" },
  { label: "Smart Contracts", value: "Audited by CertiK" },
  { label: "Token Standard", value: "ERC-1400" },
];

const HowItWorks = forwardRef<HTMLElement>((_, ref) => {
  return (
    <section ref={ref} id="how-it-works" className="px-6 md:px-10 py-24 border-t border-border">
      <motion.h2
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.7, ease }}
        className="font-display text-3xl md:text-5xl font-extrabold tracking-[-0.02em] text-foreground mb-16"
      >
        How it works
      </motion.h2>

      {/* Steps grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.7, delay: i * 0.1, ease }}
            className={`py-8 md:px-8 ${i < 2 ? "md:border-r border-border" : ""} ${i > 0 ? "border-t md:border-t-0 border-border" : ""}`}
          >
            <span className="text-xs text-muted-foreground tracking-[0.2em] uppercase">{step.num}</span>
            <h3 className="font-display text-xl font-bold text-foreground mt-3 mb-3">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Trust strip */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.7, delay: 0.2, ease }}
        className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row gap-8 md:gap-16"
      >
        {trust.map((item) => (
          <div key={item.label}>
            <p className="text-[11px] text-muted-foreground tracking-[0.15em] uppercase">{item.label}</p>
            <p className="text-sm font-medium text-foreground mt-1">{item.value}</p>
          </div>
        ))}
      </motion.div>
    </section>
  );
});

HowItWorks.displayName = "HowItWorks";
export default HowItWorks;
