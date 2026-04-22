import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const ProblemSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const problems = [
    "Hardware teams move too slowly.",
    "Specs break late in the cycle.",
    "Verification is reactive, not predictive.",
    "Architecture decisions lack data.",
  ];

  return (
    <section ref={ref} className="py-32 md:py-48 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <span className="text-sm font-mono text-primary tracking-wider uppercase">
            The Problem
          </span>
        </motion.div>

        <div className="space-y-8">
          {problems.map((problem, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="text-3xl md:text-5xl font-medium text-muted-foreground leading-tight"
            >
              {problem}
            </motion.p>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20"
        >
          <div className="circuit-line w-32" />
        </motion.div>
      </div>
    </section>
  );
};

export default ProblemSection;
