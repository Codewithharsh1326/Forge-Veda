import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { FileText, Layers, Code, TestTube, Truck } from "lucide-react";

const AgenticFlowSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const steps = [
    {
      icon: FileText,
      title: "Spec",
      description: "Gap analysis identifies missing constraints and flags infeasible specs.",
    },
    {
      icon: Layers,
      title: "Architecture",
      description: "Ranked architectures with PPA scores, bottleneck analysis, and IP reuse metrics.",
    },
    {
      icon: Code,
      title: "RTL",
      description: "Block hierarchy planning with datapath, control, and memory decomposition.",
    },
    {
      icon: TestTube,
      title: "Verification",
      description: "Auto-generated SystemVerilog testbenches targeting async resets, FIFO edge cases, protocol compliance.",
    },
    {
      icon: Truck,
      title: "Sourcing",
      description: "Foundry evaluation with cost-per-good-die analysis, lead times, and packaging options.",
    },
  ];

  return (
    <section ref={ref} id="flow" className="py-32 md:py-48 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="text-sm font-mono text-primary tracking-wider uppercase mb-4 block">
            Agentic Flow
          </span>
          <h2 className="text-4xl md:text-5xl font-semibold">
            End-to-end reasoning
          </h2>
        </motion.div>

        <div className="relative">
          {/* Connection line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
            className="absolute top-16 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent origin-left hidden md:block"
          />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.15 }}
                className="group relative"
              >
                <div className="glass-panel p-6 h-full transition-all duration-300 hover:border-primary/30">
                  <div className="relative mb-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <step.icon className="w-6 h-6 text-primary" />
                    </div>
                    {/* Node indicator */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary/40 group-hover:bg-primary animate-pulse-glow hidden md:block" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AgenticFlowSection;
