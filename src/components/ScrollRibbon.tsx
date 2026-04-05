import { motion, useScroll } from "framer-motion";

const ScrollRibbon = () => {
  const { scrollYProgress } = useScroll();
  
  // Creates a highly professional, smooth, sweeping 'fiber optic' aesthetic
  // using precisely engineered, perfectly parallel cubic bezier curves.
  const paths = [
    "M 0 0 C 120 10, -20 90, 100 100",
    "M 10 -10 C 130 0, -10 80, 110 90",
    "M -10 10 C 110 20, -30 100, 90 110"
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      <svg
        className="w-full h-full opacity-[0.3]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {paths.map((d, i) => (
          <g key={i}>
            {/* Ghost track (barely visible track underneath) */}
            <path
              d={d}
              stroke="rgba(255,255,255,0.02)"
              strokeWidth={i === 0 ? "3" : "1"}
              fill="none"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            {/* Glowing tracer that permanently fills up the page as you scroll */}
            <motion.path
              d={d}
              stroke="#ffffff"
              strokeWidth={i === 0 ? "3" : "1"}
              fill="none"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              style={{
                pathLength: scrollYProgress,
              }}
              className={i === 0 ? "drop-shadow-[0_0_10px_rgba(255,255,255,1)] opacity-70" : "opacity-30"}
            />
          </g>
        ))}
      </svg>
    </div>
  );
};

export default ScrollRibbon;
