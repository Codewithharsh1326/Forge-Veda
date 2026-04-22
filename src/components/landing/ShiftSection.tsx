import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const ShiftSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-32 md:py-48 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <span className="text-sm font-mono text-primary tracking-wider uppercase">
            The Shift
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-6xl font-semibold mb-12 leading-tight"
        >
          ForgeVeda is not a tool.
          <br />
          <span className="text-gradient">It's a new category.</span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="space-y-6 text-xl text-muted-foreground leading-relaxed max-w-2xl"
        >
          <p>
            Autonomous agents that understand silicon constraints. They don't just assist—they
            reason, evaluate trade-offs, and produce engineering-grade outputs.
          </p>
          <p>
            From gap analysis through verification planning, every decision is backed by
            real metrics. No hallucinations. No feasibility violations.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 grid grid-cols-3 gap-8"
        >
          {[
            { value: "10×", label: "Faster iteration" },
            { value: "98%", label: "Coverage targets" },
            { value: "5", label: "Specialized agents" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-semibold text-gradient mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ShiftSection;
