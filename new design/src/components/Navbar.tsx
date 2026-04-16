import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const navItems = ["Features", "AI Insights", "Solutions", "Security", "About"];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl transition-all duration-500 rounded-2xl ${
        scrolled ? "glass glow-cyan" : "glass"
      }`}
    >
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg btn-glow flex items-center justify-center">
            <span className="font-display font-bold text-sm text-accent-foreground">M</span>
          </div>
          <span className="font-display font-bold text-lg text-foreground">
            MediCare <span className="text-gradient-cyan">Pro</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(" ", "-")}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 relative group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2">
            Login
          </button>
          <button className="btn-glow text-sm font-semibold px-5 py-2.5 rounded-xl text-accent-foreground">
            Get Started
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
