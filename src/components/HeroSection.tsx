import { forwardRef, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useCurrency } from "@/contexts/CurrencyContext";

const words = ["Invest", "in", "Local", "Businesses", "with", "Blockchain"];

const wordVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.15 * i,
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  }),
};

interface HeroSectionProps {
  onExplore: () => void;
}

const HeroSection = forwardRef<HTMLElement, HeroSectionProps>(({ onExplore }, ref) => {
  const { symbol, format } = useCurrency();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const headlineY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const headlineOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} id="hero" className="relative min-h-screen">
      <div ref={containerRef} className="px-6 md:px-10 pt-32 md:pt-44 pb-24">
        {/* Massive headline with word-by-word reveal + parallax */}
        <motion.div
          style={{ y: headlineY, opacity: headlineOpacity }}
          className="mb-20"
        >
          <h1 className="font-display text-[clamp(3rem,8vw,7.5rem)] font-extrabold leading-[0.95] tracking-[-0.03em]">
            {words.map((word, i) => (
              <motion.span
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={wordVariants}
                className="inline-block mr-[0.3em] text-foreground"
              >
                {word}
              </motion.span>
            ))}
          </h1>
        </motion.div>

        {/* Description + stats split */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-12 border-t border-border pt-10">
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-base md:text-lg text-muted-foreground max-w-md leading-relaxed"
          >
            Buy micro-equity stakes in verified MSMEs. Transparent, secure,
            and powered by smart contracts. Starting from just {format(100)}.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex gap-12"
          >
            {[
              { label: "Businesses Listed", value: "120+" },
              { label: "Total Invested", value: `${symbol}4.2Cr` },
              { label: "Avg. Returns", value: "18.5%" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-2xl md:text-3xl font-extrabold text-foreground">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground tracking-[0.1em] uppercase mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Explore button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-14"
        >
          <button
            onClick={onExplore}
            className="px-8 py-3.5 rounded-md text-[11px] font-semibold tracking-[0.2em] uppercase bg-foreground text-background hover:bg-muted-foreground transition-colors duration-200 cursor-pointer"
          >
            Explore Flow
          </button>
        </motion.div>
      </div>
    </section>
  );
});

HeroSection.displayName = "HeroSection";
export default HeroSection;
