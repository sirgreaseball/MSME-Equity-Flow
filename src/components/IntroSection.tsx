import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Blocks } from "lucide-react";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const IntroSection = () => {
  const navigate = useNavigate();

  return (
    <section
      className="relative h-screen w-full flex flex-col overflow-hidden cursor-default select-none bg-transparent"
    >
      {/* Top bar — logo left, enter right */}
      <div className="relative z-10 flex items-center justify-between w-full px-8 md:px-12 pt-8">
        <motion.div
          whileInView={{ opacity: 1, x: 0 }}
          initial={{ opacity: 0, x: -20 }}
          transition={{ duration: 1, ease }}
          viewport={{ once: false }}
          className="flex items-center gap-4"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary"
          >
            <Blocks className="w-5 h-5 text-primary-foreground" />
          </div>
          <span
            className="font-display text-[11px] font-black tracking-[0.3em] uppercase hidden md:block text-foreground"
          >
            Equity Flow
          </span>
        </motion.div>

        <motion.button
          whileInView={{ opacity: 1, x: 0 }}
          initial={{ opacity: 0, x: 20 }}
          transition={{ duration: 1, delay: 0.3, ease }}
          viewport={{ once: false }}
          onClick={() => navigate("/listings")}
          className="font-display text-[11px] font-bold tracking-[0.2em] uppercase bg-transparent border border-foreground text-foreground px-5 py-2 rounded-md cursor-pointer transition-all duration-300 hover:bg-foreground hover:text-background"
        >
          Enter App →
        </motion.button>
      </div>

      {/* Center — huge type */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-8">
        <div className="text-center">
          <motion.h1
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 30 }}
            transition={{ duration: 1.2, delay: 0.2, ease }}
            viewport={{ once: false }}
            className="font-display font-extrabold leading-[0.9] tracking-[-0.04em] text-foreground"
            style={{ fontSize: "clamp(3.5rem, 10vw, 9rem)" }}
          >
            Micro Equity
            <br />
            <span className="text-muted-foreground">for Everyone</span>
          </motion.h1>

          <motion.p
            whileInView={{ opacity: 1 }}
            initial={{ opacity: 0 }}
            transition={{ duration: 1, delay: 0.8, ease }}
            viewport={{ once: false }}
            className="text-sm md:text-base mt-8 max-w-md mx-auto leading-relaxed text-muted-foreground"
          >
            Invest in local businesses through blockchain.
            <br className="hidden md:block" />
            Transparent. Tokenized. Starting at ₹100.
          </motion.p>
        </div>
      </div>

      {/* Bottom nav */}
      <motion.div
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        transition={{ delay: 1.1, duration: 0.9, ease }}
        viewport={{ once: false }}
        className="relative z-10 flex items-center justify-center gap-16 md:gap-20 pb-12"
      >
        {[
          { label: "How It Works", target: "/listings" },
          { label: "Browse", target: "/listings" },
          { label: "Connect Wallet", target: "/auth" },
        ].map(({ label, target }) => (
          <button
            key={label}
            onClick={() => navigate(target)}
            className="font-display text-[10px] md:text-[11px] font-bold tracking-[0.3em] uppercase cursor-pointer transition-opacity duration-300 hover:opacity-50 border-none bg-transparent text-muted-foreground hover:text-foreground"
          >
            {label}
          </button>
        ))}
      </motion.div>
    </section>
  );
};

export default IntroSection;
