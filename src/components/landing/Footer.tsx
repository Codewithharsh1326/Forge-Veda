const Footer = () => {
  return (
    <footer className="py-12 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <span className="text-xs font-bold text-primary-foreground">FV</span>
          </div>
          <span className="text-sm text-muted-foreground">
            © 2025 ForgeVeda. Built for silicon teams.
          </span>
        </div>

        <nav className="flex items-center gap-6">
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Privacy
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Terms
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Security
          </a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
