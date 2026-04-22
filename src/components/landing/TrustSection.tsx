import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Shield, Cpu, Gauge } from "lucide-react";

const TrustSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const principles = [
    {
      icon: Cpu,
      title: "EDA-Aware by Design",
      description: "Every recommendation respects silicon reality. Power envelopes, thermal limits, memory bandwidth—all validated.",
    },
    {
      icon: Gauge,
      title: "Built for Real Constraints",
      description: "No hallucinated feasibility. Agents flag violations before they become costly late-cycle discoveries.",
    },
    {
      icon: Shield,
      title: "Enterprise-Grade Security",
      description: "Role-based access, audit logs for all AI decisions, and proprietary RTL never exposed.",
    },
  ];

  return (
    <section ref={ref} className="py-32 md:py-48 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="text-sm font-mono text-primary tracking-wider uppercase mb-4 block">
            Trust & Depth
          </span>
          <h2 className="text-4xl md:text-5xl font-semibold mb-6">
            Built for silicon teams
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Designed by engineers who understand that hardware development has no room for error.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {principles.map((principle, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
              className="glass-panel-elevated p-8 group"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/15 transition-colors">
                <principle.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">{principle.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {principle.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
