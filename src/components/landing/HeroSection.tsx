import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CircuitBackground from "./CircuitBackground";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-gradient">
      <CircuitBackground />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight mb-8 leading-[0.95]">
            From specification
            <br />
            <span className="text-gradient">to silicon.</span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Hardware design at the speed of software. An autonomous pipeline from Architecture to Sourcing.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button asChild size="lg" className="group glow-accent">
              <Link to="/command-center">
                Enter Command Center
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="text-muted-foreground hover:text-foreground">
              <a href="#flow">
                View Architecture Flow
              </a>
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Gradient fade at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
