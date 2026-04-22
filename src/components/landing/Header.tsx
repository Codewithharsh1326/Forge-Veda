import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="glass-panel px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-lg font-semibold tracking-tight">ForgeVeda</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="/#flow" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Platform
            </a>
            <Link to="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Documentation
            </Link>
            <Link to="/enterprise" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Enterprise
            </Link>
          </nav>

          <Button asChild size="sm" className="hidden">
            {/* Launch button hidden as requested */}
            <Link to="/command-center">
              Launch
            </Link>
          </Button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
